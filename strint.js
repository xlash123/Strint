//Creates a number stored as a string for better arithmatic precision
function Strint(input){
	input = '' + input;
	const format = /^([-+]?\d+(\.\d*)?|\.\d+)$/g;
	if(format.test(input)){		//Values are stored as whole integers either as a whole or a decimal.
		//[0] represents the ones, [1] represents the tens, etc.
		this.wholes = [];
		//[0] represents the tenths, [1] represents the hundreths, etc.
		this.decimals = [];

		var negate = 1;

		if(input[0] == '-'){
			var negate = -1;
			input = input.substring(1);
		}else if(input[0] == '+'){
			input = input.substring(1);
		}

		var decIndex = input.indexOf('.');

		if(decIndex !== -1){
			//Parsing the decimal values
			var zeroIndex = -1;
			for(var i=decIndex+1; i<input.length; i++){
				var num = parseInt(input[i])*negate;
				this.decimals.push(num);
				if(num == 0 && zeroIndex == -1){
					zeroIndex = this.decimals.length-1;
				}else if(num !== 0) zeroIndex = -1;
			}
			if(zeroIndex !== -1){
				this.decimals.splice(zeroIndex, this.decimals.length-zeroIndex);
			}
		}

		if(decIndex == -1){
			decIndex = input.length;
		}

		//Used for eliminated extraneous zeros for memory preservation
		var zeroIndex = -1;
		//Parsing the whole values
		for(var i=decIndex-1; i>=0; i--){
			var num = parseInt(input[i]) * negate;
			this.wholes.push(num);
			if(num == 0 && zeroIndex == -1){
				zeroIndex = this.wholes.length-1;
			}else if(num !== 0) zeroIndex = -1;
		}
		if(zeroIndex !== -1){
			this.wholes.splice(zeroIndex, this.wholes.length-zeroIndex);
		}

		this.toString = function(){
			var ret = '';
			var isNegative = false;
			if(this.wholes[this.wholes.length-1] < 0 || this.decimals[this.decimals.length-1] < 0){
				isNegative = true;
			}
			if(isNegative) ret += '-';
			if(this.wholes.length == 0) ret += '0';
			for(var i=this.wholes.length-1; i>=0; i--){
				ret += Math.abs(this.wholes[i]);
			}
			if(this.decimals.length !== 0) ret += '.';
			for(var i=0; i<this.decimals.length; i++){
				ret += Math.abs(this.decimals[i]);
			}
			return ret;
		}

		this.clone = function(){
			var copy = new Strint("0");
			copy.wholes = this.wholes.slice(0);
			copy.decimals = this.decimals.slice(0);
			return copy;
		}

		//Returns the strint with every digit negated.
		this.negate = function(){
			var copy = this.clone();
			for(var i=0; i<copy.wholes.length; i++){
				copy.wholes[i] *= -1;
			}
			for(var i=0; i<copy.decimals.length; i++){
				copy.decimals[i] *= -1;
			}

			return copy;
		}

		//Turns a strint that has non-single-digit values in its arrays into a valid strint
		const validate = function(strint){
			var allPos = true;
			var allNeg = true;

			var zeroIndex = -1;
			var keepIndexing = true;
			for(var i=strint.wholes.length-1; i>=0; i--){
				var num = strint.wholes[i];

				if(keepIndexing && num == 0){
					zeroIndex = i;
				}else if(num !== 0){
					keepIndexing = false;
				}

				if(num < 0) allPos = false;
				else if(num > 0) allNeg = false;
				if(!keepIndexing && !allPos && !allNeg) break;
			}
			if(zeroIndex !== -1) strint.wholes.splice(zeroIndex, strint.wholes.length-zeroIndex);

			zeroIndex = -1;
			keepIndexing = true;
			for(var i=strint.decimals.length-1; i>=0; i--){
				var num = strint.decimals[i];

				if(keepIndexing && num == 0){
					zeroIndex = i;
				}else if(num !== 0){
					keepIndexing = false;
				}
				
				if(num < 0) allPos = false;
				else if(num > 0) allNeg = false;
				if(!keepIndexing && !allPos && !allNeg) break;
			}
			if(zeroIndex !== -1) strint.decimals.splice(zeroIndex, strint.decimals.length-zeroIndex);

			//It has to be 0, which is valid
			if(allPos && allNeg) return strint;

			//If the leading nonzero number is negative, I have to negate the expression for the validation algorithm to work, then negate the final answer.
			var isLeadingNegative = false;
			if(strint.wholes.length > 0){
				isLeadingNegative = strint.wholes[strint.wholes.length-1] < 0;
			}else{
				for(var i=0; i<strint.decimals.length; i++){
					var num = strint.decimals[i];
					if(num !== 0){
						isLeadingNegative = num < 0;
						break;
					}
				}
			}
			if(isLeadingNegative){
				return validate(strint.negate()).negate();
			}

			//Main part of the validation. It carries over into the other places to make it a normal base 10 number
			var carry = 0;
			for(var i=strint.decimals.length-1; i>=0; i--){
				strint.decimals[i] += carry;
				carry = 0;
				var num = strint.decimals[i];
				if(num > 9){
					carry = 1;
					strint.decimals[i] -= 10;
				}else if(num < 0){
					carry = -1;
					strint.decimals[i] += 10;
				}
			}
			for(var i=0; i<strint.wholes.length; i++){
				strint.wholes[i] += carry;
				carry = 0;
				var num = strint.wholes[i];
				if(num > 9){
					strint.wholes[i] -= 10;
					carry = 1;
				}else if(num < 0){
					carry = -1;
					strint.wholes[i] += 10;
				}
			}
			if(carry > 0){
				strint.wholes.push(carry);
			}

			//Remove any more existing extraneous zeros
			zeroIndex = -1;
			for(var i=strint.wholes.length-1; i>=0; i--){
				var num = strint.wholes[i];

				if(keepIndexing && num == 0){
					zeroIndex = i;
				}else if(num !== 0){
					break;
				}
			}
			if(zeroIndex !== -1) strint.wholes.splice(zeroIndex, strint.wholes.length-zeroIndex);

			zeroIndex = -1;
			for(var i=strint.decimals.length-1; i>=0; i--){
				var num = strint.decimals[i];

				if(keepIndexing && num == 0){
					zeroIndex = i;
				}else if(num !== 0){
					break;
				}
			}
			if(zeroIndex !== -1) strint.decimals.splice(zeroIndex, strint.decimals.length-zeroIndex);

			return strint;
		}

		this.add = function(adder){
			if(!(adder instanceof Strint)) throw 'Parameter not of type Strint';
			var copy = this.clone();
			var copyAdder = adder.clone();

			var maxWholes = Math.max(copy.wholes.length, copyAdder.wholes.length);
			var maxDecimals = Math.max(copy.decimals.length, copyAdder.decimals.length);

			//Extend all arrays to the same length
			if(copy.wholes.length < maxWholes){
				for(var i=maxWholes-copy.wholes.length; i>=0; i--){
					copy.wholes.push(0);
				}
			}
			if(copyAdder.wholes.length < maxWholes){
				for(var i=maxWholes-copyAdder.wholes.length; i>=0; i--){
					copyAdder.wholes.push(0);
				}
			}
			if(copy.decimals.length < maxDecimals){
				for(var i=maxDecimals-copy.decimals.length; i>=0; i--){
					copy.decimals.push(0);
				}
			}
			if(copyAdder.decimals.length < maxDecimals){
				for(var i=maxDecimals-copyAdder.decimals.length; i>=0; i--){
					copyAdder.decimals.push(0);
				}
			}

			//Add everything up
			for(var i=0; i<maxWholes; i++){
				copy.wholes[i] += copyAdder.wholes[i];
			}
			for(var i=0; i<maxDecimals; i++){
				copy.decimals[i] += copyAdder.decimals[i];
			}

			//Make sure all digits are single digits
			return validate(copy);
		}

		this.subtract = function(subber){
			if(!(subber instanceof Strint)) throw 'Parameter not of type Strint';
			return this.add(subber.negate());
		}

		this.multiply = function(mult){
			if(!(mult instanceof Strint)) throw 'Parameter not of type Strint';
			var copy = this.clone();
			var copyMult = mult.clone();

			var maxWholes = Math.max(copy.wholes.length, copyMult.wholes.length);
			var maxDecimals = Math.max(copy.decimals.length, copyMult.decimals.length);

			//Extend all arrays to the same length
			if(copy.wholes.length < maxWholes){
				for(var i=maxWholes-copy.wholes.length; i>=0; i--){
					copy.wholes.push(0);
				}
			}
			if(copyMult.wholes.length < maxWholes){
				for(var i=maxWholes-copyMult.wholes.length; i>=0; i--){
					copyMult.wholes.push(0);
				}
			}
			if(copy.decimals.length < maxDecimals){
				for(var i=maxDecimals-copy.decimals.length; i>=0; i--){
					copy.decimals.push(0);
				}
			}
			if(copyMult.decimals.length < maxDecimals){
				for(var i=maxDecimals-copyMult.decimals.length; i>=0; i--){
					copyMult.decimals.push(0);
				}
			}


		}

		this.equals = function(number){
			if(!(number instanceof Strint)) throw 'Parameter not of type Strint';

			var zero = new Strint("0");
			var sub = this.subtract(number);
			return sub.wholes.length == 0 && sub.decimals.length == 0;
		}

		this.greaterThan = function(number){
			if(!(number instanceof Strint)) throw 'Parameter not of type Strint';

			var sub = this.subtract(number);

			return !(sub.wholes[sub.wholes.length-1] < 0 || sub.decimals[sub.decimals.length-1] < 0) && !(sub.wholes.length == 0 && sub.decimals.length == 0);
		}

		this.lessThan = function(number){
			if(!(number instanceof Strint)) throw 'Parameter not of type Strint';

			var sub = this.subtract(number);

			return (sub.wholes[sub.wholes.length-1] < 0 || sub.decimals[sub.decimals.length-1] < 0) && !(sub.wholes.length == 0 && sub.decimals.length == 0);
		}

		this.greaterThanOrEqual = function(number){
			return !this.lessThan(number);
		}

		this.lessThanOrEqual = function(number){
			return !this.greaterThan(number);
		}

		//Shifts (or multiplies by a power of 10) Strint. positive is left, negative is right (think 10^amount)
		this.shift = function(amount){
			if(!(amount instanceof Strint)) throw 'Parameter not of type Strint';
			var move = 1;
			if(amount.lessThan(new Strint("0"))){
				move = -1;
			}
		}

	}else{
		throw "Not a valid number.";
	}
}

var test = new Strint("0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006");

console.log(test.add(new Strint("0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003216754751232757")).toString())