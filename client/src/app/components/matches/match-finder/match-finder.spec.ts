import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchFinder } from './match-finder';

describe('MatchFinder', () => {
  let component: MatchFinder;
  let fixture: ComponentFixture<MatchFinder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchFinder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchFinder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
