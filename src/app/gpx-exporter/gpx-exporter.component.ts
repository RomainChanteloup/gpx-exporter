import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GpxExporterService } from '../services/gpx-exporter.service';

@Component({
  selector: 'app-gpx-exporter',
  imports: [FormsModule],
  templateUrl: './gpx-exporter.component.html',
  styleUrl: './gpx-exporter.component.css'
})
export class GpxExporterComponent {
  colorPickerValue = '#ffffff';
  opacityValue = 1;

  constructor(private gpxExporterService: GpxExporterService) {}

  handleFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.gpxExporterService.readGpxFile(file);
    }
  }
}
