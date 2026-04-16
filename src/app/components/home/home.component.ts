import { CommonModule } from '@angular/common';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { QuantityService } from '../../services/quantity.service';
import { ChangeDetectorRef } from '@angular/core';

type QuantityType = 'length' | 'weight' | 'volume' | 'temperature';
type OperationType = 'convert' | 'compare' | 'add' | 'subtract' | 'multiply' | 'divide';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  userName: string | null = null;

  selectedType: QuantityType = 'length';
  selectedOperation: OperationType = 'convert';

  firstValue: number = 1;
  secondValue: number = 1;

  // ✅ FIX 1: firstUnit/secondUnit ab unitMap se match karte hain (UPPERCASE)
  firstUnit = 'METERS';
  secondUnit = 'CENTIMETERS';

  resultText: string = '';
  isLoading: boolean = false;

  unitMap: Record<QuantityType, string[]> = {
    length: ['METERS', 'CENTIMETERS', 'MILLIMETERS', 'KILOMETERS', 'INCHES', 'FEET', 'YARDS'],
    weight: ['GRAMS', 'KILOGRAMS', 'MILLIGRAMS', 'POUNDS'],
    volume: ['LITERS', 'MILLILITERS', 'GALLONS'],
    temperature: ['CELSIUS', 'FAHRENHEIT', 'KELVIN']
  };

  operationMap: Record<QuantityType, OperationType[]> = {
    length: ['convert', 'compare', 'add', 'subtract', 'multiply', 'divide'],
    weight: ['convert', 'compare', 'add', 'subtract', 'multiply', 'divide'],
    volume: ['convert', 'compare', 'add', 'subtract', 'multiply', 'divide'],
    temperature: ['convert', 'compare']
  };

  // ✅ FIX 2: NgZone inject kiya — change detection guarantee ke liye
  constructor(
    private router: Router,
    private auth: AuthService,
    private quantityService: QuantityService,
    private zone: NgZone,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userName = this.auth.getUser();
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  selectType(type: QuantityType): void {
    this.selectedType = type;
    const allowedOps = this.operationMap[type];
    if (!allowedOps.includes(this.selectedOperation)) {
      this.selectedOperation = 'convert';
    }
    this.resetUnitsForType();
    this.resultText = '';
  }

  selectOperation(operation: OperationType): void {
    this.selectedOperation = operation;
    this.resultText = '';
  }

  // ✅ FIX 1: defaults ab unitMap se exactly match karte hain
  resetUnitsForType(): void {
    const defaults: Record<QuantityType, { from: string; to: string }> = {
      length:      { from: 'METERS',  to: 'CENTIMETERS' },
      weight:      { from: 'KILOGRAMS', to: 'GRAMS'     },
      volume:      { from: 'LITERS',  to: 'MILLILITERS' },
      temperature: { from: 'CELSIUS', to: 'FAHRENHEIT'  }
    };
    this.firstUnit  = defaults[this.selectedType].from;
    this.secondUnit = defaults[this.selectedType].to;
    this.firstValue  = 1;
    this.secondValue = 1;
  }

  get isConvertMode(): boolean {
    return this.selectedOperation === 'convert';
  }

  performAction(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.resultText = '';

    const typeMap: Record<QuantityType, string> = {
      length:      'LengthUnit',
      weight:      'WeightUnit',
      volume:      'VolumeUnit',
      temperature: 'TemperatureUnit'
    };

    const requestBody = {
      thisQuantityDTO: {
        value: this.firstValue,
        unit: this.firstUnit,                          // already UPPERCASE hai
        measurementType: typeMap[this.selectedType]
      },
      thatQuantityDTO: {
        value: this.isConvertMode ? 0 : this.secondValue,
        unit: this.secondUnit,                         // already UPPERCASE hai
        measurementType: typeMap[this.selectedType]
      }
    };

    const apiUrl = this.quantityService.getApiByOperation(this.selectedOperation);

    this.quantityService.postData(apiUrl, requestBody).subscribe({
      next: (res: any) => {
        // ✅ FIX 2: NgZone.run() — UI update Angular zone ke andar force hoga
        this.zone.run(() => {
          this.isLoading = false;

          if (this.selectedOperation === 'compare') {
            this.resultText = res.resultString ?? 'No result';
          } else {
            this.resultText = `${res.resultValue} ${this.formatUnit(res.resultUnit || this.secondUnit)}`;
          }

          this.saveToHistory();
          this.cd.detectChanges(); 
        });
      },
      error: (err: any) => {
        this.zone.run(() => {
          this.isLoading = false;
          console.error(err);
          this.resultText = 'Error: Backend se response nahi aaya. Please try again.';
        });
      }
    });
  }

  private getHistoryKey(): string {
    const user = this.auth.getUser() || 'guest';
    return `quantity-history-${user}`;
  }

  saveToHistory(): void {
    const key = this.getHistoryKey();
    const existing = localStorage.getItem(key);
    const history = existing ? JSON.parse(existing) : [];

    history.unshift({
      id: Date.now(),
      type: this.selectedType,
      operation: this.selectedOperation,
      firstValue: this.firstValue,
      firstUnit: this.firstUnit,
      secondValue: this.isConvertMode ? null : this.secondValue,
      secondUnit: this.secondUnit,
      resultText: this.resultText,
      createdAt: new Date().toLocaleString()
    });

    localStorage.setItem(key, JSON.stringify(history));
  }

  goToHistory(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/history']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  formatUnit(unit: string): string {
    return unit ? unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase() : '';
  }
}