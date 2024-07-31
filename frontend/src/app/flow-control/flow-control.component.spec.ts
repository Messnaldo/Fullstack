import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowControlComponent } from './flow-control.component';

describe('FlowControlComponent', () => {
  let component: FlowControlComponent;
  let fixture: ComponentFixture<FlowControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
