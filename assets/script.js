/*************************************** */
// const dayjs = require('dayjs');
/********************************** */
var apiKey = '35a61cefc31c8f6c748fd7b5c38b3247';
var lat;
var lon;


async function getCoords(entry) {
    console.log("fetching city coordinates...");

    let requestUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${entry}&limit=5&appid=${apiKey}`;

    try {
        const response = await fetch(requestUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        console.log(`For city: ${data[0].name}, ${data[0].state} ${data[0].country}
        Lat : ${data[0].lat}, Lon : ${data[0].lon}`);
        var lat = data[0].lat;
        var lon = data[0].lon;
        // console.log(data[0]);

        const weatherDays = await getApi(lat, lon);


        return weatherDays;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error to be caught by the caller
    }
}

async function getApi(lat, lon) {
    console.log("fetching weather data...");
    // Replace {API key} with your actual OpenWeatherMap API key

    let requestUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    try {
        const response = await fetch(requestUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        // console.log(data.list[0]);~
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

        for (i = 0; i < data.list.length; i++) {
            forecastDate = getDate(data.list[i].dt);
            if ((forecastDate > currentDate || forecastDate <= 5) && (!datesForecasted.includes(forecastDate))) {
                datesForecasted.push(forecastDate);
            }
        }
        let perDayData = {};


        data.list.forEach(threeHourForecast => {
            let date = getDate(threeHourForecast.dt);
            let high = formatTemp(threeHourForecast.main.temp_max);
            let low = formatTemp(threeHourForecast.main.temp_min);
            let humidity = threeHourForecast.main.humidity;
            let desc = threeHourForecast.weather[0].description;

            if (!perDayData[date]) {
                perDayData[date] = [{ high, low, humidity, desc }];
            } else {
                perDayData[date].push({ high, low, humidity, desc });
            }

            perDayData[date].sort((a, b) => b - a);

            return perDayData;
        });

        //datesForcasted will return the current date (ex. 12/14/2023 => '14').
        console.log('datesForcasted Array vv : ')
        console.log(datesForecasted)
        console.log("******************************");
        //perDayData will return an object with each date ^^ as a property and each property will hold an array with the three hour splits from the 
        // api and their data ex. 
        // '15': [
        // { high: 31, low: 31, humidity: 73 },
        // { high: 31, low: 31, humidity: 70 },
        // { high: 31, low: 31, humidity: 68 }, etc ]
        console.log('perDayData object vv : ')
        console.log(perDayData);
        console.log("******************************");


        datesHigh = [];
        datesLow = [];
        // This forEach loop vv takes the highs and lows for each 3 hour split and pushes them into a dateTemps array. The array is sorted for each day into
        // sortedDateTemps. We can then take the first and last index and display the absolute high and absolute low for that day given from the splits.
        datesForecasted.forEach(date => {
            dateTemps = [];
            perDayData[date].forEach(temps => {
                dateTemps.push(temps.high);
                dateTemps.push(temps.low);
            })
            sortedDateTemps = dateTemps.sort((a, b) => b - a);
            console.log(`High/Low temps for ${date} : ${sortedDateTemps}`);
            datesHigh.push(sortedDateTemps[0]);
            datesLow.push(sortedDateTemps[sortedDateTemps.length - 1]);
        })

        datesHumidity = [];
        //This forEach loop will take the average humidty from each 3 hour split per day
        datesForecasted.forEach(date => {
            perDateHumidity = [];

            perDayData[date].forEach(value => {
                perDateHumidity.push(value.humidity);
            })
            datesHumidity.push(averageArrayRounded(perDateHumidity));
        })

        datesDesc = [];
        // This forEach loop will take the descriptions generated with each 3 hour split and find the most common desc to return
        console.log('---------------------------------------------------------');
        datesForecasted.forEach(date => {
            perDateDesc = [];

            perDayData[date].forEach(value => {
                perDateDesc.push(value.desc);
            })

            const countMap = {};
            perDateDesc.forEach(value => {
                countMap[value] = (countMap[value] || 0) + 1;
            });

            let mostFrequentDesc;
            let maxCount = 0;

            for (const value in countMap) {
                if (countMap[value] > maxCount) {
                    mostFrequentDesc = value;
                    maxCount = countMap[value];
                }
            }

            datesDesc.push(mostFrequentDesc);

        })
        console.log(datesDesc);
        console.log('---------------------------------------------------------');



        console.log("******************************");
        console.log('Final Values in weatherDays array');

        const weatherDays = [
            // CURRENT DAY
            {
                day: datesForecasted[0],
                high: datesHigh[0],
                low: datesLow[0],
                humidity: datesHumidity[0],
                desc: datesDesc[0]
            },
            //DAY +1, AKA TOMORROW
            {
                day: datesForecasted[1],
                high: datesHigh[1],
                low: datesLow[1],
                humidity: datesHumidity[1],
                desc: datesDesc[1]
            },
            //DAY +2
            {
                day: datesForecasted[2],
                high: datesHigh[2],
                low: datesLow[2],
                humidity: datesHumidity[2],
                desc: datesDesc[2]
            },
            //DAY +3
            {
                day: datesForecasted[3],
                high: datesHigh[3],
                low: datesLow[3],
                humidity: datesHumidity[3],
                desc: datesDesc[3]
            },
            //DAY +4
            {
                day: datesForecasted[4],
                high: datesHigh[4],
                low: datesLow[4],
                humidity: datesHumidity[4],
                desc: datesDesc[4]
            },
        ]
        console.log(weatherDays);
        return weatherDays;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error to be caught by the caller
    }
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
    return dayjs(dt * 1000).format('D');
}

function formatTemp(temp) {
    return Math.round((temp - 273.15) * 9 / 5) + 32;
}

function averageArrayRounded(array) {
    let sum = 0;

    for (let i = 0; i < (array.length); i++) {
        sum += array[i];
    }
    return Math.round(sum / (array.length));
}


// ****************************** Document Stuff **********************
if (!localStorage.getItem('Search History')) {
    var searchHistory = [];
    console.log('searchHistory array declared')
} else {
    console.log('searchHistory found');
    var searchHistory = JSON.parse(localStorage.getItem('Search History'));
}

//Show history
function showHistory() {
    console.log('deleting')
    var deleteMe = document.querySelectorAll('.historyLi');

    deleteMe.forEach(function (element) {
        element.remove();
    });

    for (i = 0; i < searchHistory.length; i++) {
        console.log('added li')
        let newLi = $('<li>');
        let newButton = $('<button>');

        newLi.attr('id', `button${[i]}`);
        newLi.attr('class', 'historyLi');
        newButton.attr('class', 'button is-fullwidth');
        newButton.text(searchHistory[i]);

        $('#historyList').append(newLi);
        $(`#button${[i]}`).append(newButton);

    }
}
console.log(JSON.parse(localStorage.getItem('Search History')))
showHistory();

$('#fetch-button').click(async function () {
    let userEntry = $('.input').val();
    if (userEntry) {
        $('#currentCity').text(`Now Showing for ${userEntry}`);
        if (!searchHistory.includes(userEntry)) {
            searchHistory.push(userEntry);
            localStorage.setItem('Search History', JSON.stringify(searchHistory));
            showHistory();
        }
        $('.input').val('')

        try {
            const weatherDays = await getCoords(userEntry)
            console.log(`WeatherDaysFinal : ${weatherDays}`);
            console.log(`Current Weather : ${weatherDays[0].desc}`)


        } catch (error) {
            console.error('Error:', error);
        }
    }
});
