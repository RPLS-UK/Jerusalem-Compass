import { Component, ViewChild } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCol,
  IonGrid,
  IonRow,
  IonCard,
  IonCardContent,
  IonCardSubtitle,
  IonCardHeader,
  IonCardTitle,
  IonModal,
  IonFooter,
  IonIcon,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  closeCircle,
  happy,
  helpCircle,
  informationCircle,
  navigateCircle,
} from 'ionicons/icons';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonCol,
    IonIcon,
    IonGrid,
    IonRow,
    IonHeader,
    IonCard,
    IonFooter,
    IonModal,
    IonCardContent,
    IonCardSubtitle,
    IonCardHeader,
    IonCardTitle,
    CommonModule,
  ],
})
export class HomePage {
  // Information Windows
  @ViewChild(IonModal) modal!: IonModal;
  // Maos
  private map: L.Map | undefined;
  private location: L.Map | undefined;
  // DOM
  public locationServices: boolean = false;
  public activeTrack: boolean = false;
  point: string = 'display: none;';
  // Logic
  bearing = 0;
  deviceAngleDelta = 0;

  constructor() {
    this.bearing = 0;
    this.deviceAngleDelta = 0;

    // Icons
    addIcons({
      closeCircle,
      helpCircle,
      informationCircle,
      navigateCircle,
      happy,
    });
  }

  ngOnInit(): void {
  }

  // Initialize the map
  private initMap(): void {
    const defaultIcon = L.icon({
      iconUrl: '../assets/images/compass.png',
      iconSize: [110, 110],
      iconAnchor: [50, 50],
      popupAnchor: [0, 0],
      className: 'direction',
    });

    var prayIcon = L.icon({
      iconUrl: '../assets/images/pray.png',
      iconSize: [100, 100],
      iconAnchor: [30, 30],
      popupAnchor: [0, 0],
    });

    // Set the default marker icon
    L.Marker.prototype.options.icon = defaultIcon;

    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error(
        'Map container not found! Make sure <div id="map"></div> exists in the DOM.'
      );
      return;
    }

    // Create map centered at a default location
    this.map = L.map('map', { zoomControl: false }).setView(
      [31.777849, 35.234864],
      15
    );
    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.scrollWheelZoom.disable();
    this.map.dragging.disable();
    this.map.boxZoom.disable();
    this.map.keyboard.disable();
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    L.marker([31.779, 35.2347], { icon: prayIcon }).addTo(this.map);
    var circle = L.circle([31.7781, 35.2357], {
      color: 'gold',
      fillColor: 'rgba(255, 255, 255, 1)',
      fillOpacity: 0.8,
      radius: 200,
      weight: 13,
    }).addTo(this.map);

    // Client Loading
    this.FetchLocation();
  }

  // Lifecycle hook to initialize the map after the view is loaded
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
    });
  }

  async FetchLocation() {
    const mapContainer = document.getElementById('location');
    if (!mapContainer) {
      console.error(
        'Map container not found! Make sure <div id="map"></div> exists in the DOM.'
      );
      return;
    }
    // Client Map
    // High Accuracy Pointer Update - Where Available
    window.addEventListener(
      'deviceorientation',
      this.getOrientation.bind(this),
      true
    );
    // this.location = L.map('location').setView([31.777052, 35.230200], 20);
    this.location = L.map(mapContainer).fitWorld();
    this.location
      .locate({ setView: true, watch: true, timeout: 10000 })
      .on('locationfound', (x) => {
        var rad = Math.atan2(
          35.234864 - x.latlng.lng,
          31.777849 - x.latlng.lat
        );
        this.bearing = (rad * 180.0) / Math.PI;
        this.location?.addLayer(L.marker([x.latlng.lat, x.latlng.lng]));
        // Compass Pointer Update - Default North
        this.point =
          'height: 177px;align-items: end; transform: rotate(' +
          this.bearing +
          'deg);z-index: 1000;position: relative;';
        this.locationServices = true;
      })
      .on('locationerror', (e) => {
        // console.log(e);
        this.point = 'display: none;';
        this.locationServices = false;
        // alert('Location access has been denied.');
      });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.location);

    this.location.touchZoom.disable();
    this.location.doubleClickZoom.disable();
    this.location.scrollWheelZoom.disable();
    this.location.dragging.disable();
    this.location.boxZoom.disable();
    this.location.keyboard.disable();
  }

  getOrientation(evt: any) {
    if (evt.webkitCompassHeading) {
      //iphone
      this.deviceAngleDelta = 360 - evt.webkitCompassHeading;
      this.getHighAccuracyBearing();
    } else if (evt.alpha) {
      //android
      this.deviceAngleDelta = evt.alpha;
      this.getHighAccuracyBearing();
    } else {
      // console.log('compass direction not found');
    }
    this.deviceAngleDelta = Math.round(this.deviceAngleDelta);
    this.getHighAccuracyBearing();
  }

  getHighAccuracyBearing() {
    var deg = this.deviceAngleDelta + this.bearing;
    // console.log(deg);
    if (this.bearing != 0) {
      // Compass Pointer Update
      this.point =
        'height: 177px;align-items: end; transform: rotate(' +
        deg +
        'deg);z-index: 1000;position: relative;';
      this.activeTrack = true;
    } else {
      this.activeTrack = false;
    }
  }
}
