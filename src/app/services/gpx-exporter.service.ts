import { Injectable } from '@angular/core';
import GpxParser from 'gpxparser';
import * as geolib from 'geolib';

@Injectable({
  providedIn: 'root'
})
export class GpxExporterService {

  gpxData: GpxParser | undefined;

  constructor() { }

  readGpxFile(file: File): Promise<GpxParser> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const gpx = new GpxParser();
          gpx.parse(content);
          this.gpxData = gpx;
          console.log('Parsed GPX:', gpx);
          resolve(gpx);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (e) => {
        reject(e);
      };
      reader.readAsText(file);
    });
  }

  generateCanvasFromGpx(
    trackColor: string = 'red', // Color of the track line
    trackOpacity: number = 1.0, // Opacity of the track line (0.0 to 1.0)
    backgroundColor: string = 'white', // Background color of the canvas
    transparentBackground: boolean = false // Whether the background should be transparent
  ): HTMLCanvasElement | null {
    console.log("Values ", trackColor, trackOpacity, backgroundColor, transparentBackground)

    if (!this.gpxData || !this.gpxData.tracks || this.gpxData.tracks.length === 0) {
      console.error('No GPX data available or no tracks found.');
      return null;
    }

    const track = this.gpxData.tracks[0]; // Assuming one track for simplicity
    const points = track.points.map(point => ({ latitude: point.lat, longitude: point.lon }));

    if (points.length < 2) {
      console.error('Not enough points to generate a canvas.');
      return null;
    }

    const bounds = geolib.getBounds(points);
    const center = geolib.getCenter(points)
    if (!center) {
      console.error('No center calculated from points.');
      return null;
    }

    const centerTyped = center as { longitude: number; latitude: number; };

    if (!bounds) {
      console.error('Invalid bounds calculated from points.', bounds);
      return null;
    }

    const canvasSize = 500;
    // Calculate the maximum distance to determine the scale
    const width = geolib.getPreciseDistance(
      { latitude: centerTyped.latitude, longitude: bounds.minLng },
      { latitude: centerTyped.latitude, longitude: bounds.maxLng }
    );
    const height = geolib.getPreciseDistance(
      { latitude: bounds.minLat, longitude: centerTyped.longitude },
      { latitude: bounds.maxLat, longitude: centerTyped.longitude }
    );
    const maxDistance = Math.max(width, height);
    const scale = canvasSize / maxDistance;

    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Canvas context not available.');
      return null;
    }

    if (transparentBackground) {
      canvas.style.backgroundColor = 'transparent';
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasSize, canvasSize);
    }

    ctx.strokeStyle = trackColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = trackOpacity;
    ctx.beginPath();
    points.forEach((point, index) => {
      const dx = geolib.getDistance(
        { latitude: centerTyped.latitude, longitude: centerTyped.longitude },
        { latitude: centerTyped.latitude, longitude: point.longitude }
      ) * (point.longitude > centerTyped.longitude ? 1 : -1) * scale;
    
      const dy = geolib.getDistance(
        { latitude: centerTyped.latitude, longitude: centerTyped.longitude },
        { latitude: point.latitude, longitude: centerTyped.longitude }
      ) * (point.latitude > centerTyped.latitude ? -1 : 1) * scale;
    
      const x = canvasSize / 2 + dx;
      const y = canvasSize / 2 + dy;
    
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    console.log('Canvas generated successfully.');
    console.log(canvas)
    return canvas;
  }
}