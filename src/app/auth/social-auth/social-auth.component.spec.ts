import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialAuthComponent } from './social-auth.component';

describe('SocialAuthComponent', () => {
  let component: SocialAuthComponent;
  let fixture: ComponentFixture<SocialAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialAuthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
