import { Component, OnInit } from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';


@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.css']
})
export class TestsComponent implements OnInit {

  items: FirebaseListObservable<any[]>;
  constructor(db: AngularFireDatabase) {
    let dbt = db.list('/items');
    dbt.subscribe(next=>{
      console.log(next);
    })
    this.items = dbt;
  }

  ngOnInit() {
  }

  debug(item){
      console.log(item);
  }
}
