"use strict";
var assert = require('assert');
import Atomate from "../dev/task1/atomate.js";

describe("Task 1", function(){

    describe("Correct", () => {
        it('000', () => {
            assert.equal("Все хорошо", (new Atomate("000").Do()));
        });
        
        it('0', () => {
            assert.equal("Все хорошо", (new Atomate("0").Do()));
        });
        
        it('100', () => {
            assert.equal("Все хорошо", (new Atomate("100").Do()));
        });
        
        it('111000000', () => {
            assert.equal("Все хорошо", (new Atomate("111000000").Do()));
        });
    });

    describe("Incorrect", () => {
        it('1', () => {
            assert.equal("Не хватает нулей", (new Atomate("1").Do()));
        });
        
        it('', () => {
            assert.equal("Нет нулей", (new Atomate("").Do()));
        });
        
        it('11111000', () => {
            assert.equal("Колличество 0 меньше колличества 1", (new Atomate("11111000").Do()));
        });
        
        it('1110', () => {
            assert.equal("Колличество 0 меньше колличества 1", (new Atomate("1110").Do()));
        });
        
        it('111000', () => {
            assert.equal("Колличество 0 равно колличеству 1", (new Atomate("111000").Do()));
        });
        
        it('111001000', () => {
            assert.equal("Запрещена 1 после 0", (new Atomate("111001000").Do()));
        });
    });

});