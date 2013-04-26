/**
 * Created with JetBrains WebStorm.
 * User: anmi
 * Date: 4/18/13
 * Time: 1:27 PM
 * To change this template use File | Settings | File Templates.
 */
var myHonda = { color: "red", wheels: 4, engine: { cylinders: 4, size: 2.2 } };
var myCar = [myHonda, 2, "cherry condition", "purchased 1997"];
var newCar = myCar.slice(0, 2);

// Print the values of myCar, newCar, and the color of myHonda
//  referenced from both arrays.
console.log("myCar = " + myCar.toSource());
console.log("newCar = " + newCar.toSource());
console.log("myCar[0].color = " + myCar[0].color);
console.log("newCar[0].color = " + newCar[0].color);

// Change the color of myHonda.
myHonda.color = "purple";
console.log("The new color of my Honda is " + myHonda.color);

// Print the color of myHonda referenced from both arrays.
console.log("myCar[0].color = " + myCar[0].color);
console.log("newCar[0].color = " + newCar[0].color);