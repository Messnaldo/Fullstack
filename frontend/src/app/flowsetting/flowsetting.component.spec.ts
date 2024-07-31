import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowsettingComponent } from './flowsetting.component';

describe('FlowsettingComponent', () => {
  let component: FlowsettingComponent;
  let fixture: ComponentFixture<FlowsettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowsettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowsettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
