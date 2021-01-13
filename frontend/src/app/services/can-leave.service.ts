import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from "@angular/router";
import { CanLeaveRoute } from "../models/login.model";

@Injectable()
export class CanLeaveService implements CanDeactivate<CanLeaveRoute> {
    canDeactivate(comp: CanLeaveRoute, currRoute: ActivatedRouteSnapshot, currState: RouterStateSnapshot, nextState: RouterStateSnapshot) {
        if (!comp.canILeave) {
            return confirm('Are you sure you wish to leave?')
        }
        return true
    }
}