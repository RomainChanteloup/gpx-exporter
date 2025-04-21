import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GpxExporterComponent } from './gpx-exporter.component';

describe('GpxExporterComponent', () => {
  let component: GpxExporterComponent;
  let fixture: ComponentFixture<GpxExporterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GpxExporterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GpxExporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
