'use strict';

/**
 * Turtle logic
 *
 * Special character are:
 * -, + for yaw (turns)
 * <, > for roll
 * ^, & for pitch
 * F for drawing a line
 * f for moving without a line
 * [, ] for pushing and popping current location and orientation
 *
 * -, +, <, >, ^, & can accept an angle in paranthesis, example: +(45)
 * F, f can accept a distance in paranthesis, example: F(5)
 *
 * Rules:
 * A=FF - rule A translates to going forward twice
 * A=F+F - rule A translates to going forward once, then going left once
 * A=B+B - rule A translates to rule B then turning left then rule B again
 * A(0.5)=FA+B - stochastic rule, happens only 50% of the times
 *
 * Set random see using: numeric.seedrandom.seedrandom(seed);
 */

class Turtle {
    constructor(angle, distance, width, position, direction, up) {
        this.angle = angle;
        this.distance = distance || 1;
        this.width = width || 0.3;
        this.pos = position || new THREE.Vector3(0, 0, 0);
        this.dir = (direction || new THREE.Vector3(0, 0, 1)).normalize();
        this.up = (up || new THREE.Vector3(0, 1, 0)).normalize();
        this.right = new THREE.Vector3();
        if (this.up.equals(this.dir)) {
            this.right.set(0, 1, 0).cross(this.dir);
            this.up = this.right.cross(this.dir).normalize();
        }
        this.rules = [];
        this.axiom = '';
    }

    rule(axiom, rules) {
        this.axiom = axiom;
        this.rules = this.rules.concat(rules);
        return this;
    }

    createEdges(iterations) {
        var edges = [];
        this.go(iterations, (pos, next, width) => {
            edges.push(pos.clone(), next.clone());
        });
        return edges;
    }

    createSequances(iterations) {
        var ret = [];
        this.go(iterations, (pos, next, width) => {
            let last;
            if (ret.length > 0 && ret[ret.length - 1][ret[ret.length - 1].length - 1].equals(pos)) {
                ret[ret.length - 1].push(next.clone());
            } else {
                ret.push([pos.clone(), next.clone()]);
            }
        });
        return ret;
    }

    pitch(angle) {
        this.right.crossVectors(this.up, this.dir).normalize();
        this.dir.applyAxisAngle(this.right, angle * Math.PI / 180.0);
        this.up.applyAxisAngle(this.right, angle * Math.PI / 180.0);
    }

    turn(angle) {
        this.dir.applyAxisAngle(this.up, angle * Math.PI / 180.0);
    }

    roll(angle) {
        this.up.applyAxisAngle(this.dir, angle * Math.PI / 180.0);
    }

    go(iterations, callbackForEdge) {
        var verbose = false;
        var locationStack = [],
            programStack = [];
        var next = new THREE.Vector3();
        //numeric.seedrandom.seedrandom(1337);

        // parsing rules
        var ruleMap = {};
        this.rules.forEach(function(r) {
            var index = 1;
            if (r[index] === '(') {
                var pos = r.indexOf(')', index + 1);
                if (pos !== -1) {
                    var prob = parseFloat(r.substr(index + 1, pos - index - 1));
                    index = pos + 1;
                }
            }
            ruleMap[r[0]] = ruleMap[r[0]] || [];
            ruleMap[r[0]].push({ prob: prob, text: r.substr(index + 1) });
            ruleMap[r[0]].sort(function(a, b) { return b.prob - a.prob; }); // sorting so rules without probablity are left to the end
        });

        var text = this.axiom,
            index = 0;
        while (index < text.length || programStack.length > 0) {
            if (index >= text.length) {
                var prog = programStack.pop();
                text = prog.text;
                index = prog.index;
                continue;
            }
            var c = text[index++];
            if (c === ' ') continue;
            var params = [];
            if (text[index] === '(') {
                var pos = text.indexOf(')', index + 1);
                if (pos !== -1) {
                    params = text.substr(index + 1, pos - index - 1).split(',').map(parseFloat);
                    index = pos + 1;
                }
            }
            if (verbose) {
                console.log('process:', c, 'pos', this.pos, 'dir', this.dir, 'up', this.up);
            }
            if (c === 'V') {
                verbose = true;
            } else if (c === '+') {
                this.turn(params.length ? params[0] : this.angle);
            } else if (c === '-') {
                this.turn(-(params.length ? params[0] : this.angle));
            } else if (c === '<') {
                this.roll(params.length ? params[0] : this.angle);
            } else if (c === '>') {
                this.roll(-(params.length ? params[0] : this.angle));
            } else if (c === '^') {
                this.pitch(params.length ? params[0] : this.angle);
            } else if (c === '&') {
                this.pitch(-(params.length ? params[0] : this.angle));
            } else if (c === '[') {
                locationStack.push({ pos: this.pos.clone(), dir: this.dir.clone(), up: this.up.clone() });
            } else if (c === ']') {
                var location = locationStack.pop();
                this.pos = location.pos;
                this.dir = location.dir;
                this.up = location.up;
            } else if (c === 'F') {
                next.copy(this.pos).addScaledVector(this.dir, params.length ? params[0] : this.distance);
                callbackForEdge(this.pos, next, this.width);
                this.pos.copy(next);
            } else if (c === 'f') {
                this.pos.copy(this.pos).addScaledVector(this.dir, params.length ? params[0] : this.distance);
            } else {
                if (programStack.length >= iterations) continue;
                var nextRule = ruleMap[c];
                if (!nextRule) continue;
                programStack.push({ text: text, index: index });
                index = 0;
                if (nextRule[0].prob === undefined) {
                    text = nextRule[0].text;
                } else {
                    var rand = numeric.seedrandom.random();
                    for (var i = 0; i < nextRule.length; ++i) {
                        if (nextRule[i].prob === undefined || rand < nextRule[i].prob) {
                            text = nextRule[i].text;
                            break;
                        }
                        rand -= nextRule[i].prob;
                    }
                }
            }
        }
    }
}

if (typeof module !== 'undefined') module.exports.Turtle = Turtle;
