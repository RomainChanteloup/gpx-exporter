import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GpxExporterService } from '../services/gpx-exporter.service';

@Component({
  selector: 'app-gpx-exporter',
  imports: [FormsModule],
  templateUrl: './gpx-exporter.component.html',
  styleUrl: './gpx-exporter.component.css',
})
export class GpxExporterComponent {
  @ViewChild('canvasEl', { static: false, read: ElementRef })
  canvasEl!: ElementRef;
  /** Canvas 2d context */
  private context!: CanvasRenderingContext2D;
  colorPickerPathColorValue = '#ffffff';
  opacityPathValue = 1;
  canvas: HTMLCanvasElement | null = null;
  pathWidthValue = 2; // Track line width
  maxPathWidth = 20;
  minPathWidth = 1;
  opacityStep = 0.1;
  minOpacity = 0;
  maxOpacity = 1;
  selectedFile: File | null = null;
  selectedFileName: string = '';

  constructor(
    private gpxExporterService: GpxExporterService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    let test = (this.canvasEl.nativeElement as HTMLCanvasElement).getContext(
      '2d'
    );
    if (test !== null) {
      this.context = test;
    }
  }

  handleFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.clearCanvas();
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
      this.gpxExporterService.readGpxFile(this.selectedFile).then(() => {
        this.generateAndDisplayCanvas();
      });
    } else {
      this.selectedFile = null;
    }
  }

  regenerateCanvas() {
    this.clearCanvas();
    this.generateAndDisplayCanvas();
  }

  private generateAndDisplayCanvas() {
    if (!this.selectedFile) {
      return;
    }
    this.canvas = this.gpxExporterService.generateCanvasFromGpx(
      this.colorPickerPathColorValue,
      this.opacityPathValue,
      'white',
      true,
      this.pathWidthValue
    );
    this.displayCanvas();
  }

  clearCanvas() {
    if (this.canvasEl && this.canvasEl.nativeElement) {
      const canvas = this.canvasEl.nativeElement as HTMLCanvasElement;
      this.context.clearRect(0, 0, canvas.width, canvas.height);
      this.cdr.detectChanges();
    }
  }

  displayCanvas() {
    if (this.canvas) {
      this.context.drawImage(this.canvas, 0, 0);
      this.cdr.detectChanges();
    }
  }

  saveCanvas() {
    if (this.canvas) {
      this.saveCanvasAs(this.canvas, 'canvas.png');
    }
  }

  saveCanvasAs(canvas: HTMLCanvasElement, fileName: string) {
    // get image data and transform mime type to application/octet-stream
    var canvasDataUrl = canvas
      .toDataURL()
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

  increasePathWidth() {
    if (this.pathWidthValue < this.maxPathWidth) {
      this.pathWidthValue++;
      this.regenerateCanvas();
    }
  }

  decreasePathWidth() {
    if (this.pathWidthValue > this.minPathWidth) {
      this.pathWidthValue--;
      this.regenerateCanvas();
    }
  }

  increaseOpacity() {
    if (this.opacityPathValue < this.maxOpacity) {
      this.opacityPathValue = Math.min(
        this.maxOpacity,
        +(this.opacityPathValue + this.opacityStep).toFixed(1)
      );
      this.regenerateCanvas();
    }
  }

  decreaseOpacity() {
    if (this.opacityPathValue > this.minOpacity) {
      this.opacityPathValue = Math.max(
        this.minOpacity,
        +(this.opacityPathValue - this.opacityStep).toFixed(1)
      );
      this.regenerateCanvas();
    }
  }
}
