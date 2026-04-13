import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// import { AuthFormComponent } from '../../auth-form/auth-form';
import { AuthService } from '../../services/auth.service';
import {QuantityService} from "../../services/quantity.service";

type QuantityType = 'length' | 'weight' | 'volume' | 'temperature';
type OperationType =
  | 'convert'
  | 'compare'
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide';

interface HistoryItem {
  id: number;
  type: QuantityType;
  operation: OperationType;
  firstValue: number;
  firstUnit: string;
  secondValue: number;
  secondUnit: string;
  resultText: string;
  createdAt: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  selectedType: QuantityType = 'length';
  selectedOperation: OperationType = 'convert';

  firstValue = 1;
  secondValue = 100;

  firstUnit = 'metres';
  secondUnit = 'centimetres';

  resultText = '1 Metres = 100 Centimetres';

  unitMap: Record<QuantityType, string[]> = {
    length: ['metres', 'centimetres', 'millimetres', 'kilometres', 'inches', 'feet', 'yards'],
    weight: ['grams', 'kilograms', 'milligrams', 'pounds'],
    volume: ['litres', 'millilitres', 'gallons'],
    temperature: ['celsius', 'fahrenheit', 'kelvin']
  };

  operationMap: Record<QuantityType, OperationType[]> = {
    length: ['convert', 'compare', 'add', 'subtract', 'multiply', 'divide'],
    weight: ['convert', 'compare', 'add', 'subtract', 'multiply', 'divide'],
    volume: ['convert', 'compare', 'add', 'subtract', 'multiply', 'divide'],
    temperature: ['convert', 'compare']
  };

   constructor(
     private router: Router,
     private auth: AuthService,
     private quantityService: QuantityService
   ) {
    this.resetUnitsForType();
    this.calculate();
   }

  selectType(type: QuantityType): void {
    this.selectedType = type;
    const allowedOperations = this.operationMap[type];
    if (!allowedOperations.includes(this.selectedOperation)) {
      this.selectedOperation = 'convert';
    }
    this.resetUnitsForType();
    this.calculate();
  }

  selectOperation(operation: OperationType): void {
    this.selectedOperation = operation;
    this.calculate();
  }

  onInputChange(): void {
    this.calculate();
  }

  resetUnitsForType(): void {
    if (this.selectedType === 'length') {
      this.firstUnit = 'metres';
      this.secondUnit = 'centimetres';
      this.firstValue = 1;
      this.secondValue = 0;
    } else if (this.selectedType === 'weight') {
      this.firstUnit = 'kilograms';
      this.secondUnit = 'grams';
      this.firstValue = 1;
      this.secondValue = 0;
    } else if (this.selectedType === 'volume') {
      this.firstUnit = 'litres';
      this.secondUnit = 'millilitres';
      this.firstValue = 1;
      this.secondValue = 0;
    } else {
      this.firstUnit = 'celsius';
      this.secondUnit = 'fahrenheit';
      this.firstValue = 0;
      this.secondValue = 0;
    }
  }

  calculate(): void {
    if (this.selectedOperation === 'convert') {
      const converted = this.convertValue(
        this.selectedType,
        this.firstValue,
        this.firstUnit,
        this.secondUnit
      );
      this.secondValue = this.roundValue(converted);
      this.resultText = `${this.firstValue} ${this.formatUnit(this.firstUnit)} = ${this.secondValue} ${this.formatUnit(this.secondUnit)}`;
      return;
    }

    if (this.selectedOperation === 'compare') {
      const firstComparable =
        this.selectedType === 'temperature'
          ? this.convertTemperature(this.firstValue, this.firstUnit, 'celsius')
          : this.toBaseUnit(this.selectedType, this.firstValue, this.firstUnit);

      const secondComparable =
        this.selectedType === 'temperature'
          ? this.convertTemperature(this.secondValue, this.secondUnit, 'celsius')
          : this.toBaseUnit(this.selectedType, this.secondValue, this.secondUnit);

      if (firstComparable > secondComparable) {
        this.resultText = `${this.firstValue} ${this.formatUnit(this.firstUnit)} is greater than ${this.secondValue} ${this.formatUnit(this.secondUnit)}`;
      } else if (firstComparable < secondComparable) {
        this.resultText = `${this.firstValue} ${this.formatUnit(this.firstUnit)} is smaller than ${this.secondValue} ${this.formatUnit(this.secondUnit)}`;
      } else {
        this.resultText = `${this.firstValue} ${this.formatUnit(this.firstUnit)} is equal to ${this.secondValue} ${this.formatUnit(this.secondUnit)}`;
      }
      return;
    }

    const firstBase = this.toBaseUnit(this.selectedType, this.firstValue, this.firstUnit);
    const secondBase = this.toBaseUnit(this.selectedType, this.secondValue, this.secondUnit);

    let resultBase = 0;

    switch (this.selectedOperation) {
      case 'add':
        resultBase = firstBase + secondBase;
        break;
      case 'subtract':
        resultBase = firstBase - secondBase;
        break;
      case 'multiply':
        resultBase = firstBase * secondBase;
        break;
      case 'divide':
        if (secondBase === 0) {
          this.resultText = 'Cannot divide by zero';
          return;
        }
        resultBase = firstBase / secondBase;
        break;
    }

    const convertedResult = this.fromBaseUnit(this.selectedType, resultBase, this.firstUnit);
    this.resultText = `Result: ${this.roundValue(convertedResult)} ${this.formatUnit(this.firstUnit)}`;
  }

  performAction(): void {

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const requestBody = this.buildRequestBody();

    const apiUrl = this.quantityService.getApiByOperation(this.selectedOperation);

    this.quantityService.postData(apiUrl, requestBody)
      .subscribe((res: any) => {

      if (this.selectedOperation === 'compare') {
        this.resultText = res.resultString;
      } else {
        this.resultText = `${res.resultValue} ${res.resultUnit}`;
      }

      this.saveToHistory();
    });
  }

  saveToHistory(): void {
    const existingHistory = localStorage.getItem('quantity-history');
    const history: HistoryItem[] = existingHistory ? JSON.parse(existingHistory) : [];

    const newItem: HistoryItem = {
      id: Date.now(),
      type: this.selectedType,
      operation: this.selectedOperation,
      firstValue: this.firstValue,
      firstUnit: this.firstUnit,
      secondValue: this.secondValue,
      secondUnit: this.secondUnit,
      resultText: this.resultText,
      createdAt: new Date().toLocaleString()
    };

    history.unshift(newItem);
    localStorage.setItem('quantity-history', JSON.stringify(history));
  }

  convertValue(type: QuantityType, value: number, from: string, to: string): number {
    if (type === 'temperature') {
      return this.convertTemperature(value, from, to);
    }
    const baseValue = this.toBaseUnit(type, value, from);
    return this.fromBaseUnit(type, baseValue, to);
  }

  toBaseUnit(type: QuantityType, value: number, unit: string): number {
    if (type === 'length') {
      const factors: Record<string, number> = {
        millimetres: 0.001,
        centimetres: 0.01,
        metres: 1,
        kilometres: 1000,
        inches: 0.0254,
        feet: 0.3048,
        yards: 0.9144
      };
      return value * factors[unit];
    }

    if (type === 'weight') {
      const factors: Record<string, number> = {
        milligrams: 0.001,
        grams: 1,
        kilograms: 1000,
        pounds: 453.592
      };
      return value * factors[unit];
    }

    if (type === 'volume') {
      const factors: Record<string, number> = {
        millilitres: 0.001,
        litres: 1,
        gallons: 3.78541
      };
      return value * factors[unit];
    }

    return value;
  }

  fromBaseUnit(type: QuantityType, value: number, unit: string): number {
    if (type === 'length') {
      const factors: Record<string, number> = {
        millimetres: 0.001,
        centimetres: 0.01,
        metres: 1,
        kilometres: 1000,
        inches: 0.0254,
        feet: 0.3048,
        yards: 0.9144
      };
      return value / factors[unit];
    }

    if (type === 'weight') {
      const factors: Record<string, number> = {
        milligrams: 0.001,
        grams: 1,
        kilograms: 1000,
        pounds: 453.592
      };
      return value / factors[unit];
    }

    if (type === 'volume') {
      const factors: Record<string, number> = {
        millilitres: 0.001,
        litres: 1,
        gallons: 3.78541
      };
      return value / factors[unit];
    }

    return value;
  }

  convertTemperature(value: number, from: string, to: string): number {
    let celsius = value;

    if (from === 'fahrenheit') {
      celsius = (value - 32) * 5 / 9;
    } else if (from === 'kelvin') {
      celsius = value - 273.15;
    }

    if (to === 'celsius') return celsius;
    if (to === 'fahrenheit') return (celsius * 9 / 5) + 32;
    if (to === 'kelvin') return celsius + 273.15;

    return value;
  }

  formatUnit(unit: string): string {
    return unit.charAt(0).toUpperCase() + unit.slice(1);
  }

  roundValue(value: number): number {
    return Number(value.toFixed(4));
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
  buildRequestBody() {
    const typeMap: any = {
      length: 'LengthUnit',
      weight: 'WeightUnit',
      volume: 'VolumeUnit',
      temperature: 'TemperatureUnit'
    };

    return {
      thisQuantityDTO: {
        value: this.firstValue,
        unit: this.firstUnit.toUpperCase(),
        measurementType: typeMap[this.selectedType]
      },
      thatQuantityDTO: {
        value: this.secondValue,
        unit: this.secondUnit.toUpperCase(),
        measurementType: typeMap[this.selectedType]
      }
    };
  }
}