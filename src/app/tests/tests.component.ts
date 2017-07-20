import { Component, OnInit, NgZone, ApplicationRef } from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';

import { ApiAiClient } from "api-ai-javascript";
import { environment } from "../../environments/environment";

import * as _ from "lodash";
import { Observable } from "rxjs/Observable";

interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.css']
})
export class TestsComponent implements OnInit {

  items: FirebaseListObservable<any[]>;
  riddles: FirebaseListObservable<any[]>;

  speechRecognition: any;

  isRunning:boolean;
  actualRiddle:number = 0;
  client : ApiAiClient;
  lastResponse:string;
  previousResponse:string;
  lastValidResponse:string;

  speechData: string;
  showTalkButton: boolean;
  
  unknowSpeaksCount:number=0;

  voice:any;

  constructor(db: AngularFireDatabase, private zone: NgZone, private applicationRef: ApplicationRef) {
    this.items = db.list('/items');
    this.riddles = db.list('/riddle');
    
    this.client = new ApiAiClient({accessToken: environment.apiai.clientAccessToken});
    this.talkToAI("oi");
  }


  ngOnInit() {
    this.isRunning = false;
    this.showTalkButton = true;
    let self = this;
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = ()=>{this.logVoices(self)};
    }
  }

  ngOnDestroy() {
      this.DestroySpeechObject();
  }

  setResponse(res, update){
      if(update)
        this.previousResponse = this.lastResponse;

      console.log(update + ":    " + this.previousResponse);
      this.lastResponse = res;
  }

  logVoices(self){
    var synth = window.speechSynthesis;
    let voices = synth.getVoices();

    for(let i = 0; i < voices.length ; i++) {
        if(voices[i].lang == "pt-br" || voices[i].lang == "pt-BR"){
            this.voice = voices[i];
        }
    }
  }

  unknownSpeak(){
    //this.setResponse(this.previousResponse, false);
    if(this.unknowSpeaksCount == 0)
        this.setResponse("Fale de novo", false);
    else
        this.setResponse("Tente outra pergunta", false);

    this.unknowSpeaksCount++;
    console.log("Do not know what to do");
    this.talk();
    this.applicationRef.tick() 

  }

  talkToAI(text:string){
    this.client
      .textRequest(text)
        .then((response:any) => {
          console.log(response);
          
          if(response.result.action){
            let update = true;

            if(this.unknowSpeaksCount > 0 && this[response.result.action] != this.unknownSpeak){
                this.unknowSpeaksCount = 0;
                update = false;
            }
            else if(this.unknowSpeaksCount > 0 && this[response.result.action] == this.unknownSpeak)
                update = false;
                    
            console.log(update);
            this.setResponse(response.result.fulfillment.speech, update);

            if(this[response.result.action]){
                this[response.result.action]();
            }
          }
          else
            this.setResponse(response.result.fulfillment.speech, true);
          
          if(response.result.parameters.riddle){
            this.setResponse(response.result.parameters.riddle, true);
          }

          this.showTalkButton = true;
          this.applicationRef.tick() 
        })
        .catch((error) => {
            console.log(error);
            this.showTalkButton = true;
            this.applicationRef.tick() 
        })
  }

  talk(){
    this.showTalkButton = false;

    this.record().subscribe(
        //listener
        (value) => {
            this.speechData = value;
            console.log(value);
        },
        //errror
        (err) => {
            console.log(err);
            if (err.error == "no-speech") {
                console.log("--restatring service--");
                //this.activateSpeechSearchMovie();
            }
        },
        //completion
        () => {
            this.showTalkButton = true;
            console.log("--complete--");
            this.talkToAI(this.speechData);
            //this.activateSpeechSearchMovie();
        });
  }
  
  showRiddleTitle(){
    var sub = this.riddles.subscribe(res=>{
        this.setResponse(res[this.actualRiddle].hint, true);
    });
  }

  readLastSpeech(){
    if(!this.previousResponse) return;

    this.setResponse(this.previousResponse, false);

    let msg = new SpeechSynthesisUtterance(this.previousResponse);

    var synth = window.speechSynthesis;
    msg.voice = this.voice;
    console.log(msg.voice);

    synth.speak(msg);
  }

  record(): Observable<string> {
        return Observable.create(observer => {
            const { webkitSpeechRecognition }: IWindow = <IWindow>window;
            this.speechRecognition = new webkitSpeechRecognition();
            //this.speechRecognition = SpeechRecognition;
            this.speechRecognition.continuous = false;
            //this.speechRecognition.interimResults = true;
            this.speechRecognition.lang = 'pt-br';
            this.speechRecognition.maxAlternatives = 1;

            this.speechRecognition.onresult = speech => {
                let term: string = "";
                if (speech.results) {
                    var result = speech.results[speech.resultIndex];
                    var transcript = result[0].transcript;
                    if (result.isFinal) {
                        if (result[0].confidence < 0.3) {
                            console.log("Unrecognized result - Please try again");
                        }
                        else {
                            term = _.trim(transcript);
                            console.log("Did you said? -> " + term + " , If not then say something else...");
                        }
                    }
                }
                this.zone.run(() => {
                    observer.next(term);
                });
            };

            this.speechRecognition.onerror = error => {
                observer.error(error);
            };

            this.speechRecognition.onend = () => {
                observer.complete();
            };

            this.speechRecognition.start();
            console.log("Say something - We are listening !!!");
        });
    }

    DestroySpeechObject() {
        if (this.speechRecognition)
            this.speechRecognition.stop();
    }
}
