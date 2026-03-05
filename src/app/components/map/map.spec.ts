import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WifiMap } from './map';

describe('WifiMap', () => {
  let component: WifiMap;
  let fixture: ComponentFixture<WifiMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Map]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WifiMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
