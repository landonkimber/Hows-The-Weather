/*************************************** */
const axios = require('axios');
const dayjs = require('dayjs');
/********************************** */
function getApi() {
    console.log("fetching...")
    // Replace {API key} with your actual OpenWeatherMap API key
    var apiKey = '35a61cefc31c8f6c748fd7b5c38b3247';
    var lat = 41.222759;
    var lon = -111.970421;
    var requestUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // console.log(data.list[0]);
            // for (i = 0; i < data.list.length; i ++) {
            //     console.log('Date:', formatDate(data.list[i].dt));
            //     console.log('Currently:', data.list[0].weather[0].description);
            //     console.log('Current Temp: ', formatTemp(data.list[i].main.temp, '°F'));
            //     console.log('Feels Like:', formatTemp(data.list[i].main.feels_like), '°F');
            //     console.log('High Temp:', formatTemp(data.list[i].main.temp_max), '°F');
            //     console.log('Low Temp:', formatTemp(data.list[i].main.temp_min), '°F');
            //     console.log('Humidity:', data.list[i].main.humidity, '%');
            //     console.log('----------------------------------');
            // }
            currentDate = getDate(data.list[0].dt);
            datesForecasted = [currentDate];

            for (i = 0; i < data.list.length; i ++){
                forecastDate = getDate(data.list[i].dt);
                if ((forecastDate > currentDate || forecastDate <= 5)&& (!datesForecasted.includes(forecastDate))){
                    datesForecasted.push(forecastDate);
                }
            }
            let perDayData = {};
            
            
            data.list.forEach(threeHourForecast => {
                let date = getDate(threeHourForecast.dt);
                let high = formatTemp(threeHourForecast.main.temp_max);
                let low = formatTemp(threeHourForecast.main.temp_min);
                let humidity = threeHourForecast.main.humidity;

                if (!perDayData[date]) {
                    perDayData[date] = [{ high, low, humidity }];
                } else {
                    perDayData[date].push({ high, low, humidity });
                }
                
                perDayData[date].sort((a, b) => b - a);

                return perDayData;
            });
            
            //datesForcasted will return the current date (ex. 12/14/2023 => '14').
            console.log(datesForecasted)
            console.log("******************************");
            //perDayData will return an object with each date ^^ as a property and each property will hold an array with the three hour splits from the 
            // api and their data ex. 
            // '15': [
            // { high: 31, low: 31, humidity: 73 },
            // { high: 31, low: 31, humidity: 70 },
            // { high: 31, low: 31, humidity: 68 }, etc ]
            console.log(perDayData);
            console.log("******************************");
            
            datesHigh = [];
            datesLow = [];
            // This forEach loop vv takes the highs and lows for each 3 hour split and pushes them into a dateTemps array. The array is sorted for each day into
            // sortedDateTemps. We can then take the first and last index and display the absolute high and absolute low for that day given from the splits.
            datesForecasted.forEach(date => {
                dateTemps = [];
                perDayData[date].forEach(temps =>{
                    dateTemps.push(temps.high);
                    dateTemps.push(temps.low);
                })
                sortedDateTemps = dateTemps.sort((a, b) => b - a);
                console.log(`Temps for ${date} : ${sortedDateTemps}`);
                datesHigh.push(sortedDateTemps[0]);
                datesLow.push(sortedDateTemps[sortedDateTemps.length-1]);
            })

            console.log("******************************");

            const weatherDays = [
                // CURRENT DAY
                {
                    day: datesForecasted[0],
                    high: datesHigh[0],
                    low: datesLow[0],
                    // humidity: datesHumidity,
                    // desc: datesDesc
                },
                //DAY +1, AKA TOMORROW
                {
                    day: datesForecasted[1],
                    high: datesHigh[1],
                    low: datesLow[1],
                    // humidity: datesHumidity,
                    // desc: datesDesc
                },
                //DAY +2
                {
                    day: datesForecasted[2],
                    high: datesHigh[2],
                    low: datesLow[2],
                    // humidity: datesHumidity,
                    // desc: datesDesc
                },
                //DAY +3
                {
                    day: datesForecasted[3],
                    high: datesHigh[3],
                    low: datesLow[3],
                    // humidity: datesHumidity,
                    // desc: datesDesc
                },
                //DAY +4
                {
                    day: datesForecasted[4],
                    high: datesHigh[4],
                    low: datesLow[4],
                    // humidity: datesHumidity,
                    // desc: datesDesc
                },
            ]
            console.log(weatherDays);
            // return weatherDays;
        })
        .catch(function (error) {
            console.error('Error fetching data:', error);
        });
}
 
function formatDate(dt) {
    
    var date = new Date(dt * 1000);

    // Options for formatting the date
    var options = { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };

    // Format the date using the options
    var formattedDate = date.toLocaleString('en-US', options);

    return formattedDate;
}

function getDate(dt) {
    return dayjs(dt*1000).format('D');
}

function formatTemp(temp) {
    return Math.round((temp - 273.15) * 9 / 5) + 32;
}

getApi();
