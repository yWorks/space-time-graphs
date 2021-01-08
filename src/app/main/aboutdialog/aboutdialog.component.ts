import { Component } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog'

@Component({
  selector: 'app-about-dialog-component',
  templateUrl: './aboutdialog.component.html',
  styleUrls: ['./aboutdialog.component.css'],
})
export class AboutDialogComponent {
  constructor(public dialogRef: MatDialogRef<AboutDialogComponent>) {}
}
