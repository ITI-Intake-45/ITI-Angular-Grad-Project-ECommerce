import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  standalone:false
})
export class Home implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  coffeeBags = [
    {
      id: 1,
      name: 'POHAPOLO SSAL NDE',
      price: 24.99,
      image: 'assets/slider/mug.jpeg'
    },
    {
      id: 2,
      name: 'MALHELD CIR HELD',
      price: 28.99,
      image: 'assets/slider/images%20(2).jpeg'
    },
    {
      id: 3,
      name: 'ALPHA BARD',
      price: 32.99,
      image: 'assets/slider/accessories.jpeg'
    },
  ];

}
