// Global Variables

// Foursquare api credentials
var clientId = "SMQNYZFVCIOYIRAIXND2D5SYBLQUOPDB4HZTV13TT22AGACD"
var clientSecret = "IHBS4VBHYWJL53NLIY2HSVI5A1144GJ3MDTYYY1KLKTMC4BV"

// Points of interest array
var locations = [
    {title: 'Buffalo Bill\'s Grave', location: {lat: 39.732946, lng: -105.241003}},
    {title: 'Dinosaur Ridge', location: {lat: 39.689006, lng: -105.190569}},
    {title: 'Red Rocks Amphitheatre', location: {lat: 39.668094, lng: -105.205920}},
    {title: 'Molly Brown Summer House', location: {lat: 39.665443, lng: -105.205714}},
    {title: 'Union Station', location: {lat: 39.753681, lng: -105.000743}},
    {title: 'Denver Batonic Gardens', location: {lat: 39.731920, lng: -104.960895}}
    ];

var infoWindow;
var map;

// Array for all of the points of interest markders.
var markers = [];


//*****************************************************

// initMap()

//*****************************************************

function initMap() {

    // Get Denver Map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 39.739236, lng: -104.990251},
        zoom: 4
    });

    infoWindow = new google.maps.InfoWindow();
}


//************************************************************************

// fillInfoWindow - populates the infowindow when the marker is clicked.

//************************************************************************

function fillInfoWindow(marker) {

    // Check to make sure the infowindow is not already opened on this marker.
    if (infoWindow.marker != marker) {

        // Clear the infowindow content to give the streetview time to load.
        infoWindow.setContent('');
        infoWindow.marker = marker;

        // jquery ajax call to foursquare api
        var url = 'https://api.foursquare.com/v2/venues/search?ll=' +
                   marker.getPosition().lat() + ','
                   + marker.getPosition().lng() + '&client_id=' +
                   clientId + '&client_secret=' + clientSecret +
                   '&query=' + marker.title + '&v=20130815';
        url = encodeURI(url);

        var result = [];
        $.getJSON(url).done(function(result) {
            var response = result.response.venues[0];
            var category = response.categories[0].shortName;
            var street = response.location.formattedAddress[0];
            var city = response.location.formattedAddress[1];

            foursquareContent =
            '<div id = "contentBox">' +
            '<h3>' + marker.title + '</h3>' +
            '<h3>(' + category + ')</h3>' +
            '<h4> Address: </h4>' +
            '<p>' + street + '</p>' +
            '<p>' + city + '</p>' +
            '</div>';

            infoWindow.setContent(foursquareContent);

            // Open the infowindow on the correct marker.
            infoWindow.open(map, marker);
        }).fail(function() {
            alert("Error loading Foursquare API.\nPlease reload your page to try again.");
        });

        // Make sure the marker property is cleared if the infowindow is closed.
        infoWindow.addListener('closeclick', function() {
            infoWindow.marker = null;
        });
    }
}


//***********************************************************************

// showMarkers - loop through the markers array and display them all.

//***********************************************************************

function showMarkers() {
    var bounds = new google.maps.LatLngBounds();

    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }

    map.fitBounds(bounds);
}


//**********************************************

// Knockout ViewModel object

//**********************************************

var ViewModel = function() {
    var self = this;

    this.textInput = ko.observable("");

    //*********************************************

    // displayInfo - animate marker and display info

    //*********************************************

    this.displayInfo = function() {
        fillInfoWindow(this);

        // Bounce marker
        this.setAnimation(google.maps.Animation.BOUNCE);

        setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 1400);
    };


    //*********************************************

    // open and close menu functions

    //*********************************************

    this.openMenu = function() {
        document.getElementById("openMenu").style.width = "0";
        document.getElementById("selectMenu").style.width = "270px";
    }

    this.closeMenu = function() {
        document.getElementById("selectMenu").style.width = "0";
        document.getElementById("openMenu").style.width = "50px";
        document.getElementById("map").style.marginLeft = "50px";
    }

    //*******************************************

    // Create markers array from locations array

    //*******************************************

    for (var i = 0; i < locations.length; i++) {

        // Get the position from the location array.
        this.position = locations[i].location;
        this.title = locations[i].title;

        // Create one marker per location
        this.marker = new google.maps.Marker({
            position: this.position,
            title: this.title,
            animation: google.maps.Animation.DROP
        });

        // Create an onclick event to open the large infowindow at each marker.
        this.marker.addListener('click', self.displayInfo);

        // Push the marker to our array of markers.
        markers.push(this.marker);
    }


    //************************************************************************

    // selectFilter - Filters selected locations and sets visiblity of marker

    //************************************************************************

    this.selectFilter = ko.computed(function() {
        var selectedMarkers = [];

        for (var i = 0; i < markers.length; i++) {
            var currentMarker = markers[i];

            // See if marker title includes the textInput string
            if ( currentMarker.title.toLowerCase().includes( this.textInput().toLowerCase() ) ) {
                // It does so add marker to the selectedMarkders array
                selectedMarkers.push(currentMarker);

                // Make this marker visible
                markers[i].setVisible(true);
            } else {
                // This one filtered out so make makrder invisible
                markers[i].setVisible(false);
            }
        }

        return selectedMarkers;
    }, this);

    // initially the filter menu is closed
    this.closeMenu();

    // Display selected markers
    showMarkers();
}


//******************************

// appMain - Start the app

//******************************

function appMain() {
    initMap();
    ko.applyBindings(new ViewModel());
}

function mapsApiError() {
    alert("Error loading Google Maps. Please check your internet connection and try again.");
}
