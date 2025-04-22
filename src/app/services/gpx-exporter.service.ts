import { Injectable } from '@angular/core';
import GpxParser from 'gpxparser';
import * as geolib from 'geolib';

@Injectable({
  providedIn: 'root',
})
export class GpxExporterService {
  gpxData: GpxParser | undefined;

  constructor() {}

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
    trackColor: string = 'red',
    trackOpacity: number = 1.0,
    backgroundColor: string = 'white',
    transparentBackground: boolean = false,
    trackLineWidth: number = 2
  ): HTMLCanvasElement | null {
    if (!this.gpxData?.tracks?.length) {
      console.error('No GPX data or tracks found.');
      return null;
    }

    const track = this.gpxData.tracks[0];
    const points = track.points.map((p) => ({
      latitude: p.lat,
      longitude: p.lon,
    }));
    if (points.length < 2) {
      console.error('Not enough points to draw a path.');
      return null;
    }

    const bounds = geolib.getBounds(points);
    if (!bounds) {
      console.error('Invalid bounds.');
      return null;
    }

    const canvasSize = 500;
    const margin = 20;

    // Track size in meters
    const trackWidth = geolib.getPreciseDistance(
      { latitude: bounds.minLat, longitude: bounds.minLng },
      { latitude: bounds.minLat, longitude: bounds.maxLng }
    );
    const trackHeight = geolib.getPreciseDistance(
      { latitude: bounds.minLat, longitude: bounds.minLng },
      { latitude: bounds.maxLat, longitude: bounds.minLng }
    );

    const scaleX = (canvasSize - 2 * margin) / trackWidth;
    const scaleY = (canvasSize - 2 * margin) / trackHeight;
    const scale = Math.min(scaleX, scaleY);

    // Center offsets
    const offsetX = (canvasSize - trackWidth * scale) / 2;
    const offsetY = (canvasSize - trackHeight * scale) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Canvas context not available.');
      return null;
    }

    if (!transparentBackground) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasSize, canvasSize);
    }

    ctx.strokeStyle = trackColor;
    ctx.lineWidth = trackLineWidth;
    ctx.globalAlpha = trackOpacity;
    ctx.beginPath();

    points.forEach((point, index) => {
      const xDist = geolib.getPreciseDistance(
        { latitude: bounds.minLat, longitude: bounds.minLng },
        { latitude: bounds.minLat, longitude: point.longitude }
      );

      const yDist = geolib.getPreciseDistance(
        { latitude: bounds.minLat, longitude: bounds.minLng },
        { latitude: point.latitude, longitude: bounds.minLng }
      );

      const x = offsetX + xDist * scale;
      const y = canvasSize - (offsetY + yDist * scale); // Flip Y axis properly

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    console.log('Canvas generated successfully.');
    return canvas;
  }
}
