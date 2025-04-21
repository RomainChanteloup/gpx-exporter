import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GpxExporterService } from '../services/gpx-exporter.service';

@Component({
  selector: 'app-gpx-exporter',
  imports: [FormsModule],
  templateUrl: './gpx-exporter.component.html',
  styleUrl: './gpx-exporter.component.css'
})
export class GpxExporterComponent {
  @ViewChild('canvasEl', { static: false, read: ElementRef }) canvasEl!: ElementRef;
  /** Canvas 2d context */
  private context!: CanvasRenderingContext2D;
  colorPickerPathColorValue = '#ffffff';
  opacityPathValue = 1;
  canvas: HTMLCanvasElement | null = null;

  constructor(private gpxExporterService: GpxExporterService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    let test = (this.canvasEl.nativeElement as HTMLCanvasElement).getContext("2d")
    if(test !== null){
      this.context = test
    }
  }
    

  handleFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        const file = input.files[0];
        this.gpxExporterService.readGpxFile(file).then(() => {
            this.canvas = this.gpxExporterService.generateCanvasFromGpx(
              this.colorPickerPathColorValue,
              this.opacityPathValue,
              'white',
              true
            );
            this.displayCanvas();
        });
    }
  }
    
  displayCanvas() {
    if(this.canvas){
      this.context.drawImage(this.canvas, 0, 0);
      this.cdr.detectChanges();
    }
  }

  saveCanvas() {
    if(this.canvas){
      this.saveCanvasAs(this.canvas, 'canvas.png');
    }
  }


  saveCanvasAs(canvas: HTMLCanvasElement, fileName: string) {
    // get image data and transform mime type to application/octet-stream
    var canvasDataUrl = canvas.toDataURL()
            .replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
    var link = document.createElement('a'); // create an anchor tag

    // set parameters for downloading
    link.setAttribute('href', canvasDataUrl);
    link.setAttribute('target', '_blank');
    link.setAttribute('download', fileName);

    // compat mode for dispatching click on your anchor
    if (document.createEvent) {
        var evtObj = document.createEvent('MouseEvents');
        evtObj.initEvent('click', true, true);
        link.dispatchEvent(evtObj);
    } else if (link.click) {
        link.click();
    }
}
}
