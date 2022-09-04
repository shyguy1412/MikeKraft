import { expect } from "chai";
import { checkServer } from "../src/minestate"

describe('MineState', () =>{

        
    it('can check the status of a server', done => {
        checkServer('hypixel.net')
        .then(result => {
            expect(result).to.be.true;
            return checkServer('fakeminecraftserver19812.com')
        })
        .then(result => {
            expect(result).to.be.false;
            done();
        })
        .catch(err => done(err));
    }).timeout(10000);

})