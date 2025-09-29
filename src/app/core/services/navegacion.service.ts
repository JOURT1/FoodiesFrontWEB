import { Injectable } from '@angular/core'
import { Location } from '@angular/common'
import { Router, NavigationEnd } from '@angular/router'
import { Subject } from 'rxjs'

@Injectable({providedIn: 'root'})
export class NavegacionService {
  private history: string[] = []
  private _accionUsuarioOcurrida: Subject<void> = new Subject()

  constructor(private router: Router, private location: Location) {
  }

  clearHistory() {
    this.history = []
  }

  startSaveHistory(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects)
      }
    })
  }

  getHistory(): string[] {
    return this.history
  }

  back(): void {
    this.history.pop()
    if (this.history.length > 0) {
      this.location.back()
    } else {
      this.router.navigateByUrl('/')
    }
  }

  get accionUsuarioOcurrida() {
    return this._accionUsuarioOcurrida.asObservable()
  }

  notificarAccionUsuario() {
    this._accionUsuarioOcurrida.next()
  }
}
