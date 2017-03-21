export default class Atomate{
    constructor(str){
        this.setData(str);
    }

    setData(str){
        this.data = str;
        this.states = [];
        this.statesCount = 0;
    }

    getData(){
        let array = [];
        if (this.states.length > 0){
            this.states.forEach(v => {
                array.push({
                    'name': v.name,
                    '0': v['0'].slice(),
                    '1': v['1'].slice(),
                    'e': v['e'].slice(),
                    'isEnd': v.isEnd
                });
            });
        }
        return array;
    }

    findOR(str){
        let bracketsCount = 0;
        for (let i = 0; i < str.length; i++){
            if (str[i] == '(') bracketsCount++;
            if (str[i] == ')') bracketsCount--;
            if (bracketsCount == 0 && str[i] == "|")
                return i;
        }
        return -1;
    }

    areBracketsBalanced(){
        let s = this.data;
        let count = 0;
        for (let i = 0; i < s.length; i++) {
            if (s[i] == '(') count++;
            if (s[i] == ')') count--;
            if (count < 0) return false;
        }
        return (count == 0);
    }

    getAvailableName(){
        return 'St_' + this.statesCount;
    }

    addState(terminal_0 = [], terminal_1 = [], terminal_e = []){
        this.statesCount++;
        let name = this.getAvailableName();
        this.states.push({
            'name': name,
            '0': terminal_0,
            '1': terminal_1,
            'e': terminal_e,
            'isEnd': false
        });
        return name;
    }

    removeState(name){
        let pos = this.findState(name);
        this.states.splice(pos, 1);
    }

    findState(name){
        return this.states.findIndex(v => {
            return v.name == name;
        });
    }

    stateAddNext(name, terminal, next){
        let pos = this.findState(name);
        if (pos == -1) return false;
        this.states[pos][terminal.toString()].push(next);
        return true;
    }

    getAtomata(str, s_end = [{'name': 'Z', 'terminal': 'e'}], isStar = false, shouldRepeatFirst = false){
        if (!str.length) return s_end;

        // ищем 'ИЛИ'
        let pos = this.findOR(str);

        if (pos != -1){
            // 'ИЛИ' внутри строки
            // получение входных и выходных состояний левых и правых частей 'ИЛИ'
            let left = this.getAtomata(str.substr(0, pos), s_end);
            let right = (pos + 1 < str.length) ? this.getAtomata(str.substr(pos + 1), s_end) : s_end;

            // начало может быть null, если это пустая строка ('|10', left.begins === null)
            // тогда можем сразу задать ей конец s_end (это переданное конечное состояние)
            // if (left === null) left = s_end;
            // if (right === null) right = s_end;

            let names = left.concat(right);

            return names;
        }else{
            // нет явного ИЛИ (только внутри скобок, но это отдельно обрабатывается)
            // обработка символа (если не скобка, иначе обработка скобки рекурсивно)

            if (str[0] == '('){
                // поиск закрывающей строки
                let count = 1;
                let positions = -1;
                for (let i = 1; i < str.length && count; i++) {
                    if (str[i] == '('){
                        count++;
                    } else if (str[i] == ')') {
                        count--;
                        if (count == 0) positions = i;
                    }
                }

                let isPlus = false;
                // обработка всего
                let nextsAfterBrackets = s_end;
                if (positions + 1 < str.length) // если после скобок есть что-то
                    nextsAfterBrackets = this.getAtomata(str.substr(positions + 1), s_end);
                if (nextsAfterBrackets === true || nextsAfterBrackets === false){
                    // если после скобок звезда или плюсик
                    // то берем то, что после плюсика или звезды
                    if (nextsAfterBrackets)
                        isStar = true;
                    else
                        isPlus = true;
                    nextsAfterBrackets = (str.length > positions + 2) ? this.getAtomata(str.substr(positions + 2), s_end) : s_end;
                }
                if (isPlus || isStar){
                    // это плюс или звезда
                    // тогда надо бы создать вершину
                    // запихнуть её как конец в скобки
                    // сделать ответвление от неё на их начало
                    // продолжить по Е символу к тому, что после скобок идет
                    let stateName = this.addState();
                    let names = this.getAtomata(str.substr(1, positions - 1), [{'name': stateName, 'terminal': 'e'}]); // зациклили на нашей созданной вершине по Е дуге
                    nextsAfterBrackets.forEach(brack => {
                        this.stateAddNext(stateName, brack.terminal, brack.name);
                    });
                    names.forEach(n => {
                        this.stateAddNext(stateName, n.terminal, n.name)
                    });
                    // окей, надо бы перетащить в эту дугу лишнее состояние
                    let statesToMove = [];
                    this.states.forEach(s => {
                        // бежим по всем состояниям и ищем наше (stateName) среди Е дуг
                        if (s['e'].findIndex(v => {return v == stateName;}) != -1)
                            statesToMove.push(s.name);
                    });
                    // теперь ищем состояния, которые переходят в наши statesToMove
                    // дабы передвинуть их на нашу вершину
                    this.states.forEach((s, si) => {
                        // бежим по всем состояниям и ищем наше (stateName) среди Е дуг
                        let terminals = ['0', '1', 'e'];
                        terminals.forEach(terminal => {
                            let isStateHaveStatesToMove = s[terminal].findIndex(v => {
                                return (statesToMove.findIndex(v2 => {
                                    return (v2 == v);
                                }) != -1);
                            });
                            if (isStateHaveStatesToMove != -1){
                                // мы знаем что в состоянии 's'
                                // по треминалу 'terminal'
                                // в позиции 'isStateHaveStatesToMove'
                                // находится кто-то из 'stateToMove'
                                // т.е. нам надо заменить текущее состояние (на этой позиции)
                                // на stateName
                                this.states[si][terminal][isStateHaveStatesToMove] = stateName;
                            }
                        });
                    });
                    // после всех наших волшебных преобразований надо удалить из состояний неиспользуемые - stateToMove
                    let newStates = [];
                    this.states.forEach(state => {
                        if (statesToMove.findIndex(s => s == state.name ) == -1)
                            newStates.push(state);
                    });
                    this.states = newStates;

                    if (isPlus)
                        return names;
                    else
                        return [{
                            'name': stateName,
                            'terminal': 'e'
                        }];
                }
                
                let names = this.getAtomata(str.substr(1, positions - 1), nextsAfterBrackets);
                return names;
            }else if (str[0] == '1' || str[0] == '0'){
                // если это не все, что выше, то это обычный символ
                let name = this.addState();

                // если мы пришли сюда из скобок
                // то надо бы зациклить себя на себе же
                // if (shouldRepeatFirst) s_end = [{'name': name, 'terminal': str[0]}];

                let nexts = s_end;
                let isPlus = false;
                if (str.length >= 2){
                    nexts = this.getAtomata(str.substr(1), s_end);
                    if (nexts === true || nexts === false){
                        // если следующий элемент - звезда или плюс
                        // заранее узнаем что это, ибо дальше эта переменная меняется
                        if (nexts)
                            isStar = true;
                        else
                            isPlus = true;

                        // а тут берем рекурсию от следующего элемента
                        if (str.length >= 3)
                            nexts = this.getAtomata(str.substr(2), s_end);
                        else
                            nexts = s_end;

                        // а тут мы добавляем возврат на наш текущий элемент
                        // надо же вернуться
                        // nexts = nexts.concat([ {'name': name, 'terminal': str[0]} ]);
                    }
                }

                let currentTerminal = str[0];

                if (isStar || isPlus){
                    // если мы начали с этой строки и у нас флаг
                    // isStar (или isPlus) в тру, то надо в конечный элемент добавить начальный
                    this.stateAddNext(name, str[0], name);
                    
                    if (isStar) currentTerminal = 'e';

                    let name2 = this.addState();
                    nexts.forEach(v => {
                        this.stateAddNext(name2, v.terminal, v.name);
                    });
                    nexts = [{
                        'name': name2,
                        'terminal': 'e'
                    }];
                    s_end.push({'name': name, 'terminal': str[0]});
                }

                nexts.forEach(v => {
                    this.stateAddNext(name, v.terminal, v.name);
                });
                
                return [{'name': name, 'terminal': currentTerminal}];
            }else if (str[0] == '*' || str[0] == '+'){
                // возвращение из getAtomata true свидетельствует о знаке * (false о знаке +), иначе объект
                return (str[0] == '*');
            }else if (str[0] != ')'){
                let er = "Неподдерживаемый символ: " + str[0];
                throw er;
            }
        }
    }

    goToNFA_without_E(){
        if (this.states.length > 0){
            let been = true;
            while(been){
                been = false;
                let stateNum = 0;
                while(this.states.length > stateNum){
                    been = false;
                    let state = this.states[stateNum];
                    state['e'].forEach(eState => {
                        // eState - текущий элемент по Е символу
                        let eStateNum = this.findState(eState);
                        if (eStateNum != -1){
                            state['e'].push(this.states[eStateNum]['e']);
                        }
                    });
                    state['e'].forEach(eState => {
                        // eState - текущий элемент по Е символу
                        let eStateNum = this.findState(eState);
                        if (eStateNum != -1){
                            // надо скопировать все состояния из eState в state
                            state['0'] = state['0'].concat(this.states[eStateNum]['0']);
                            state['1'] = state['1'].concat(this.states[eStateNum]['1']);
                            state['e'] = [].concat(this.states[eStateNum]['e']);
                            if (this.states[eStateNum].isEnd) state.isEnd = true;
                            been = true;
                        }
                    });
                    state['e'] = [];
                    this.states[stateNum] = state;
                    if (!been)
                        stateNum++;
                    else
                        stateNum = 0;
                }
            }
        }
        return this.states.slice();
    }

    removeHangings(){
        // удаляем висячие вершины
        let newStates = [];
        newStates.push(this.states[0]); // добавление A
        this.states.forEach((state, stateNum) => {
            if (state.name != 'A'){
                let been = false;
                this.states.forEach((state2, stateNum2) => {
                    if (stateNum2 != stateNum && !been){
                        // разные состояния
                        if (state2['0'].findIndex(v => v == state.name) != -1) been = true;
                        if (state2['1'].findIndex(v => v == state.name) != -1) been = true;
                        if (been) newStates.push(state);
                    }
                });
            }
        });
        this.states = newStates;
    }

    removeEquivalents(){
        // объединяем одинаковые вершины
        this.states.forEach((state, stateNum) => {
            if (state.name != 'A'){
                this.states.forEach((state2, stateNum2) => {
                    if (stateNum2 != stateNum && state2.name != 'A'){
                        if (state['0'].length == state2['0'].length && state['1'].length == state2['1'].length && state.isEnd == state2.isEnd){
                            // окей, мы нашли что-то похожее, может быть они даже эквивалентны?
                            let isEquivalent = true;

                            let count_0 = state['0'].length;
                            for(let i = 0; i < count_0; i++)
                                if (state['0'][i] != state['0'][i])
                                    isEquivalent = false;
                            let count_1 = state['1'].length;
                            for(let i = 0; i < count_1; i++)
                                if (state['1'][i] != state['1'][i])
                                    isEquivalent = false;
                            
                            if (isEquivalent){
                                // так они эквивалентны!
                                // давайте заменим всё, что ссылается на state2.name на state.name
                                this.states.forEach((state3, stateNum3) => {
                                    if (stateNum3 != stateNum){
                                        let terminals = ['0', '1'];
                                        terminals.forEach(terminal => {
                                            state3[terminal].forEach((stateReplace, stateReplaceNum) => {
                                                if (stateReplace == state2.name)
                                                    this.states[stateNum3][terminal][stateReplaceNum] = state.name;
                                            });
                                        });
                                    }
                                });
                            }
                        }
                    }
                });
            }
        });
        // после объединений можем почистить всё, что могло остаться
        this.removeHangings();
    }

    concatAndReplaceStates(stateNum, terminal){
        let n = this.states.length;
        let namesToReplace = [].concat(this.states[stateNum][terminal]);
        let nexts_by_0 = [];
        let nexts_by_1 = [];
        let isEnd = this.states[stateNum].isEnd;
        let newName = this.states[stateNum][terminal].join("");
        if (this.findState(newName) != -1) return;

        namesToReplace.forEach(stateName => {
            // получаю данные из своих имен
            let pos = this.findState(stateName);
            if (pos != -1){
                let names_0 = [];
                this.states[pos]['0'].forEach(curr => {
                    if (namesToReplace.findIndex(v => curr == v) == -1)
                        names_0.push(curr);
                });
                nexts_by_0 = names_0;
                let names_1 = [];
                this.states[pos]['1'].forEach(curr => {
                    if (namesToReplace.findIndex(v => curr == v) == -1)
                        names_1.push(curr);
                });
                nexts_by_1 = names_1;
                if (this.states[pos].isEnd) isEnd = true;
            }

            // заменяю все наши имена (если найду) на новое
            this.states.forEach((state, i) => {
                let terminals = ['0', '1'];
                terminals.forEach(t => {
                    let been = false;
                    let newNames = [];
                    state[t].forEach(v => {
                        if (stateName != v){
                            newNames.push(v);
                        }else{
                            been = true;
                        }
                    });
                    if (been)
                        newNames.push(newName);
                    this.states[i][t] = [].concat(newNames);
                });
            });
        });

        this.states.push({
            'name': newName,
            '0': nexts_by_0,
            '1': nexts_by_1,
            'e': [],
            'isEnd': isEnd
        });

        let newState = [];
        this.states.forEach(state => {
            if (namesToReplace.findIndex(v => v == state.name) == -1)
                newState.push(state);
        });
        this.states = newState;

    }

    groupByName(){
        // пора бы сгруппировать по именам
        let shouldRepeat = true;
        let stateNum = 0;
        let stop = 0;
        while(stateNum < this.states.length){
            shouldRepeat = false;
            if (this.states[stateNum]['0'].length > 1){
                shouldRepeat = true;
                this.concatAndReplaceStates(stateNum, '0');
            }else if (this.states[stateNum]['1'].length > 1){
                shouldRepeat = true;
                this.concatAndReplaceStates(stateNum, '1');
            }

            if (shouldRepeat)
                stateNum = 0;
            else
                stateNum++;
            stop++;
        }
        // после объединений можем почистить всё, что могло остаться
        this.removeHangings();
    }

    goToDFA(){
        if (this.states.length > 1){
            this.removeHangings();
            this.groupByName();
            this.removeEquivalents();
            this.removeHangings();
        }

        // объединяем одинаковые переходы
        return this.states.slice();
    }

    Do(){
        if (!this.data)
            return "Пустая строка";
        let n = this.data.length;
        let error = null;
        if (!this.areBracketsBalanced())
            return "Скобки не сбалансированы!";
        
        this.states.push({
            'name': 'A',
            '0': [],
            '1': [],
            'e': [],
            'isEnd': false
        });
        this.states.push({
            'name': 'Z',
            '0': [],
            '1': [],
            'e': [],
            'isEnd': true
        });
        try{
            let inputNames = this.getAtomata(this.data);
            inputNames.forEach(v => {
                this.stateAddNext('A', v.terminal, v.name);
            });
        }catch(e){
            error = e;
        }

        if (error !== null)
            return error;
        
        return this.states.slice();
    }
}