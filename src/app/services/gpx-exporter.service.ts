import { Injectable } from '@angular/core';
import GpxParser from 'gpxparser';

@Injectable({
  providedIn: 'root'
})
export class GpxExporterService {

  gpxData: GpxParser | undefined;

  constructor() { }

  readGpxFile(file: File): void {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      console.log('GPX File Content:', content);
      const gpx = new GpxParser();
      gpx.parse(content);
      this.gpxData = gpx;
      console.log('Parsed GPX:', gpx);
    };

    reader.onerror = (e) => {
      console.error('Error reading GPX file:', e);
    };

    reader.readAsText(file);
  }
}