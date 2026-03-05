import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointDetails } from './point-details';

describe('PointDetails', () => {
  let component: PointDetails;
  let fixture: ComponentFixture<PointDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
