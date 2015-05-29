var depsJS = [
    "external/leaflet/leaflet.js",

    "external/Leaflet-GeoMixer/src/Parsers.js",
    "external/Leaflet-GeoMixer/src/Deferred.js",
    "external/Leaflet-GeoMixer/src/ImageLoader.js",
    "external/Leaflet-GeoMixer/src/ProjectiveImage.js",
    "external/Leaflet-GeoMixer/src/StyleManager.js",
    "external/Leaflet-GeoMixer/src/ScreenVectorTile.js",
    "external/Leaflet-GeoMixer/src/VectorTile.js",
    "external/Leaflet-GeoMixer/src/TilesTree.js",
    "external/Leaflet-GeoMixer/src/DataManager.js",
    "external/Leaflet-GeoMixer/src/gmxObserver.js",
    "external/Leaflet-GeoMixer/src/LabelsLayer.js",
    "external/Leaflet-GeoMixer/src/gmxAPIutils.js",
    "external/Leaflet-GeoMixer/src/gmxDrawCanvas.js", 
    "external/Leaflet-GeoMixer/src/gmxImageTransform.js",
    "external/Leaflet-GeoMixer/src/SessionManager.js",
    "external/Leaflet-GeoMixer/src/MapManager.js",
    "external/Leaflet-GeoMixer/src/gmxEventsManager.js",
    "external/Leaflet-GeoMixer/src/VectorTileLoader.js",
    "external/Leaflet-GeoMixer/src/gmxVectorLayer.js",
    "external/Leaflet-GeoMixer/src/gmxVectorLayer.Popup.js",
    "external/Leaflet-GeoMixer/src/gmxVectorLayer.Hover.js",
    "external/Leaflet-GeoMixer/src/gmxRasterLayer.js",
    "external/Leaflet-GeoMixer/src/gmxLayerFactory.js",
    "external/Leaflet-GeoMixer/src/gmxLayersVersion.js",
    "external/Leaflet-GeoMixer/src/ObjectsReorder.js",
    "external/Leaflet-GeoMixer/src/L.gmxLocale.js",
    "external/Leaflet-GeoMixer/src/lang_ru.js",
    "external/Leaflet-GeoMixer/src/lang_en.js"

    "external/L.Cadastre/src/L.ImageOverlay.Pane.js",
    "external/L.Cadastre/src/L.Cadastre.js",
    "external/L.Cadastre/src/L.Cadastre.Info.js",

    "external/gmxControls/src/js/gmxPosition.js",
    "external/gmxControls/src/js/gmxControlsManager.js",
    "external/gmxControls/src/js/L.Control.gmxIcon.js",
    "external/gmxControls/src/js/L.Control.gmxIconGroup.js",
    "external/gmxControls/src/js/L.Control.gmxDrawing.js", 
    "external/gmxControls/src/locale/L.Control.gmxDrawing.locale.ru.js",
    "external/gmxControls/src/locale/L.Control.gmxDrawing.locale.en.js",
    "external/gmxControls/src/js/L.Control.gmxCenter.js",
    "external/gmxControls/src/js/L.Control.gmxHide.js",
    "external/gmxControls/src/js/L.Control.gmxLayers.js",
    "external/gmxControls/src/js/L.Control.gmxLocation.js",
    "external/gmxControls/src/js/L.Control.gmxCopyright.js",
    "external/gmxControls/src/js/L.Control.gmxZoom.js",
    "external/gmxControls/src/js/L.Control.gmxBottom.js",
    "external/gmxControls/src/js/L.Control.gmxLogo.js",
    "external/gmxControls/src/js/L.Control.gmxSidebar.js",

    "external/Leaflet.TileLayer.Mercator/src/TileLayer.Mercator.js",

    "external/gmxDrawing/src/L.GmxDrawing.js"
];
var depsCSS = [
    "external/L.Cadastre/src/L.Cadastre.css",
    "external/leaflet/leaflet.css",

    "external/gmxControls/src/css/L.Control.gmxIcon.css",
    "external/gmxControls/src/css/L.Control.gmxIconGroup.css",
    "external/gmxControls/src/css/L.Control.gmxDrawing.css",
    "external/gmxControls/src/css/L.Control.gmxCenter.css",
    "external/gmxControls/src/css/L.Control.gmxHide.css",
    "external/gmxControls/src/css/L.Control.gmxLayers.css",
    "external/gmxControls/src/css/L.Control.gmxLocation.css",
    "external/gmxControls/src/css/L.Control.gmxCopyright.css",
    "external/gmxControls/src/css/L.Control.gmxZoom.css",
    "external/gmxControls/src/css/L.Control.gmxBottom.css",
    "external/gmxControls/src/css/L.Control.gmxSidebar.css",
    "external/gmxControls/src/css/L.Control.gmxLogo.css",
    "external/gmxControls/src/css/external.css",

    "external/gmxDrawing/css/L.gmxDrawing.css"
];

if (typeof exports !== 'undefined') {
	exports.depsJS = depsJS;
	exports.depsCSS = depsCSS;
}

if (typeof gmxAPIv2DevOnLoad === 'function') {
	gmxAPIv2DevOnLoad(depsJS, depsCSS);
}
