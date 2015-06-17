(function() {
L.vkMap = function(cont, options) {
    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
    });
    var map = new L.Map(cont, {
        // maxBounds: [
            // [55.834843, 35.907440],
            // [55.16, 37.087097]
        // ],
        layers: [osm],
        center: new L.LatLng(55.440116, 36.726608),
        zoom: 11
    });
    //L.Icon.Default.imagePath = 'http://maps.kosmosnimki.ru/api/leaflet/images';

    // var blm = map.gmxBaseLayersManager;
    // blm.initDefaults().then(function() {
        // var baseLayers = ['OSM'],
            // currentID = baseLayers[0];
        // blm.setActiveIDs(baseLayers).setCurrentID(currentID);
    // });
    // L.control.gmxLayers(blm).addTo(map);

    var controlsManager = map.gmxControlsManager;
    controlsManager.init({
        gmxLogo: {type: 'color'},
        gmxHide: {isActive: true},
        gmxLocation: {scaleFormat: 'text'},
        gmxDrawing: null //{items: ['Point', 'Rectangle', 'Polygon', 'Polyline']}
    });
    map.addControl(new L.Control.gmxIcon({
        id: 'locateMe',
        regularImageUrl: 'img/Geolocation.jpg',
        title: 'Определить мое положение'
     }).on('click', function () {
        map.locate({setView: true});
     })
    );

    var mid = null,
        markers = L.featureGroup().addTo(map),
        login = function () {
            if (mid) {
                mid = null;
                VK.Auth.logout(authInfo);
            } else {
                VK.Auth.login(authInfo, 788);
            }
        };
    var vkontakte = new L.Control.gmxIcon({
        id: 'vkontakte',
        title: 'Вход через ВКонтакте',
        togglable: true,
        addBefore: 'locateMe',
        style: {
            marginRight: '20px'
        },
        regularImageUrl: 'img/vkontakte.png'
    })
    .on('statechange', login)
    .addTo(map);

    // VK.init({
        // apiId: 4948598 // 4937579 
    // });
    var photoUtils = {
        itemKeys: {
            owner_id: true,
            posted: true,
            created: true,
            player: true,
            src: true,
            width: true,
            height: true,
            //comments: true,
            title: true,
            text: true
        },
        arr: [],
        storage: [],
        arrPhotos: [],
        arrVideos: [],
        latlng: null,
        popup: L.popup({maxWidth: 130}),
        selectPhoto: L.DomUtil.create('select', 'selectPhoto'),
        addItem: function (ph, it, type) {
            var rec = {
                owner_id: it.owner_id,
                posted: Date.now(),
                created: it.created,
                player: it.player,
                src: it.src_big || it.photo_604,
                width: it.width,
                height: it.height,
                comments: it.comments,
                title: it.title,
                text: it.text
            };
            ph.arr.unshift(rec);
            if (!('lat' in ph)) {
                ph.lat = photoUtils.latlng.lat;
                ph.lng = photoUtils.latlng.lng;
            }
            return rec.owner_id + '_' + rec.posted;
        },
        saveItem: function (attr) {
//console.log('saveItem', attr);
            var out = {
                key: attr.key,
                value: '',
                user_id: mid,
                global: 1
            };
            if (attr.value) {
                attr.value.marker.closePopup();
                delete attr.value.marker;
                attr.value.arr = attr.value.arr.map(function(it) {
                    var pt = {};
                    for (var id in it) {
                        if (photoUtils.itemKeys[id]) pt[id] = it[id];
                    }
                    return pt;
                });
                out.value = attr.value.arr.length ? JSON.stringify(attr.value) : '';
                if (photoUtils.storage[attr.ind]) {
                    photoUtils.storage[attr.ind].value = out.value;
                } else {
                    photoUtils.storage[attr.ind] = {
                        key: out.key,
                        value: out.value
                    };
                }
            }
            VK.api('storage.set', out, function() {});
        },
        setOptions: function (snode, arr) {
            snode.innerHTML = '';
            arr.items.map(function(it) {
                var opt = L.DomUtil.create('option', '', snode);
                opt.text = it.text || it.title || it.src || it.image || 'Без описания';
                return opt;
            });
        },
        setPhoto: function (ph, num) {
            var arr = ph.arr,
                len = arr.length,
                it = arr[num];
//console.log('setPhoto', num, it);
            var limit = 0;
            if (it) {
                limit = !ph.edit && (it.owner_id == mid || mid == 79660147) ? 0 : -1;
            }
            var div = photoUtils.resPhoto;
            div.innerHTML = '';

            if (it) {
                photoUtils.curNum = num;
                if (it.player) {
                    var iframe = L.DomUtil.create('iframe', 'video', div);
                    iframe.setAttribute('width', 407);
                    iframe.setAttribute('height', 360);
                    iframe.setAttribute('frameborder', 0);
                    iframe.src = it.player.replace(/http:/, 'https:') + '&hd=3';
                    photoUtils.curPopup.update();
                } else {
                    var title = L.DomUtil.create('div', 'inputDiv', div);
                    title.innerHTML = it.text || '';
                    var img = L.DomUtil.create('img', '', div);
                    img.setAttribute('width', 400);
                    img.onload = function(ev) {
                        photoUtils.curPopup.update();
                    }
                    img.src = it.src;
                }
            } else {
                photoUtils.curNum = -1;
                div.innerHTML = 'Место для фото/видео';
            }

            if (num > limit) {
                var previous = L.DomUtil.create('img', 'previous', div);
                previous.src = 'img/previous.png';
                previous.onclick = function() {
                    photoUtils.setPhoto(ph, num - 1);
                }
            }

            if (num < len - 1) {
                var next = L.DomUtil.create('img', 'next', div);
                next.src = 'img/next.png';
                next.onclick = function() {
                    photoUtils.setPhoto(ph, num + 1);
                }
            }
        },
        getPhotos: function () {
            photoUtils.selectPhoto.style.display = 'none';
            photoUtils.selectPhoto.setAttribute('size', 4);
            VK.api('photos.getAll', {
                owner_id: mid,
                count: 200,
                extended: 1,
                skip_hidden: 1,
                no_service_albums: 1
             }, function (pt) {
                photoUtils.arrPhotos = pt.response.items;
                photoUtils.setOptions(photoUtils.selectPhoto, pt.response);
                photoUtils.selectPhoto.style.display = 'block';
             }
            );
        },
        selectVideo: L.DomUtil.create('select', 'selectVideo'),
        getVideos: function () {
            photoUtils.selectVideo.style.display = 'none';
            photoUtils.selectVideo.setAttribute('size', 4);
            VK.api('video.get', {
                owner_id: mid,
                count: 200,
                extended: 1,
                skip_hidden: 1,
                no_service_albums: 1
             }, function (pt) {
                photoUtils.arrVideos = pt.response.items;
                photoUtils.setOptions(photoUtils.selectVideo, pt.response);
                photoUtils.selectVideo.style.display = 'block';
             }
            );
        },
        chkRadio: function () {
        },
        getMarker: function (it, pt, i) {
            var marker = L.marker([it.lat, it.lng], {
                    icon:  L.icon({
                        iconUrl: 'img/video.png',
                        iconRetinaUrl: 'img/videoRetina.png',
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    })
                })
                .bindPopup(L.popup({maxWidth: 10000}))
                .addTo(markers);

            if (pt && pt.value) {
                marker.on('click', function () {
                    var json = JSON.parse(pt.value);
                    photoUtils.selectItem({
                        key: pt.key,
                        arr: json.arr ? json.arr : [json],
                        ind: i,
                        lat: json.lat,
                        lng: json.lng,
                        edit: false,
                        marker: marker
                    });
                }, marker);
            }
            return marker;
        },

        selectItem: function (ph) {
//console.log('selectItem', arguments);
            var div = L.DomUtil.create('div', ''),
                marker = ph.marker,
                resPhotoClass = '';
            photoUtils.select = div;
            photoUtils.curRecord = ph;
            photoUtils.curPopup = marker._popup;
            if (ph.edit) {
                resPhotoClass = 'resPhoto';
                photoUtils.getPhotos();
                photoUtils.getVideos();
                var editDiv = L.DomUtil.create('div', '', div),
                    span = L.DomUtil.create('span', '', editDiv),
                    inputDiv = L.DomUtil.create('div', 'inputDiv', editDiv),
                    inputPhoto = L.DomUtil.create('input', 'inputPhoto', inputDiv),
                    spanPhoto = L.DomUtil.create('span', '', inputDiv),
                    inputVideo = L.DomUtil.create('input', 'inputVideo', inputDiv),
                    spanVideo = L.DomUtil.create('span', '', inputDiv),
                    selectDiv = L.DomUtil.create('div', '', editDiv);


                var bottom = L.DomUtil.create('div', '', editDiv);
                bottom.innerHTML = 'Если необходимо добавьте новое видео или фото в <a href="http://vk.com/albums' + mid + '" target="_blank">ВКонтакте</a>';

                var save = L.DomUtil.create('button', 'button', editDiv);
                save.innerHTML = 'Сохранить';
                save.onclick = function() {
                    var sitem = photoUtils.storage[ph.ind],
                        pt = {
                            value: ph,
                            ind: ph.ind
                        };
                    if (sitem) {
                        pt.key = sitem.key;
                    } else {
                        if (ph.arr.length < 1) { return; }
                        pt.ind = photoUtils.storage.length;
                        var rec = ph.arr[0];
                        pt.key = rec.owner_id + '_' + rec.posted;
                    }
                    photoUtils.saveItem(pt);
                };

                var del = L.DomUtil.create('button', 'button', editDiv);
                del.innerHTML = 'Удалить';
                del.onclick = function() {
                    photoUtils.curRecord.arr.splice(photoUtils.curNum, 1);
                    photoUtils.setPhoto(photoUtils.curRecord, photoUtils.curNum);

//console.log('del.onclick', photoUtils.curNum);
                };

                span.innerHTML = 'Выбрать: ';
                spanPhoto.innerHTML = 'Фото';
                spanVideo.innerHTML = 'Видео';
                inputPhoto.type = inputVideo.type = 'radio';
                inputPhoto.name = inputVideo.name = 'itemType';
                inputPhoto.defaultChecked = true;
                photoUtils.chkRadio = function() {
                    if (inputPhoto.checked) {
                        selectDiv.appendChild(photoUtils.selectPhoto);
                        if (photoUtils.selectVideo.parentNode) photoUtils.selectVideo.parentNode.removeChild(photoUtils.selectVideo);
                    } else {
                        selectDiv.appendChild(photoUtils.selectVideo);
                        if (photoUtils.selectPhoto.parentNode) photoUtils.selectPhoto.parentNode.removeChild(photoUtils.selectPhoto);
                    }
                    photoUtils.curPopup.update();
                };
                photoUtils.chkRadio();
                L.DomEvent.on(inputPhoto, 'click', photoUtils.chkRadio, this);
                L.DomEvent.on(inputVideo, 'click', photoUtils.chkRadio, this);
            }
            photoUtils.resPhoto = L.DomUtil.create('div', 'resPhoto', div);
            var it = ph.arr[0];
            //previous.png 
            photoUtils.setPhoto(ph, 0);

            if (!ph.edit && (mid == 79660147 || !it || it.owner_id == mid)) {
                var buttons = L.DomUtil.create('div', '', div);
                    // del = L.DomUtil.create('button', 'button', buttons);
                // del.innerHTML = 'Удалить';
                // del.onclick = function() {
                    // markers.removeLayer(marker);
                    // setItem(it.key, null);
                // };
                var add = L.DomUtil.create('button', 'button', buttons);
                add.innerHTML = 'Редактировать';
                add.onclick = function() {
                    photoUtils.selectItem({
                        key: ph.key,
                        arr: ph.arr,
                        ind: ph.ind,
                        lat: ph.lat,
                        lng: ph.lng,
                        edit: true,
                        marker: marker
                    });
                };
            }

            photoUtils.curPopup.setContent(photoUtils.select);
            photoUtils.curPopup.update();
        // },
        // selectPhoto: function (ev) {
            // photoUtils.latlng = ev.latlng;
            // photoUtils.popup.setLatLng(photoUtils.latlng);
            // photoUtils.popup.setContent(photoUtils.select);
            // photoUtils.popup.openOn(map);
            // console.log('selectPhoto ', arguments);
        }
    };
    photoUtils.selectPhoto.onchange = function(ev) {
        var ind = ev.target.selectedIndex,
            it = photoUtils.arrPhotos[ind];

        photoUtils.curIndex = ind;
//console.log('onchange selectPhoto', ind, it);
        if (it) {
            var ph = photoUtils.curRecord;
            photoUtils.addItem(ph, it, 'photo');
            photoUtils.setPhoto(ph, 0);
        }
    };
    photoUtils.selectVideo.onchange = function(ev) {
        var ind = ev.target.selectedIndex,
            it = photoUtils.arrVideos[ind];
//console.log('onchange selectVideo', ind, it);
        photoUtils.curIndex = ind;
        if (it) {
            var ph = photoUtils.curRecord;
            photoUtils.addItem(ph, it, 'video');
            photoUtils.setPhoto(ph, 0);
            // photoUtils.resPhoto.innerHTML = '<iframe src="' + it.player + '" width="607" height="360" frameborder="0"></iframe>';
            // photoUtils.curPopup.update();
        }
    };
    function clickMap(ev) {
        photoUtils.latlng = ev.latlng;
        var ph = {
            lat: photoUtils.latlng.lat,
            lng: photoUtils.latlng.lng,
            arr: []
        };
        photoUtils.curRecord = ph;
        var marker = photoUtils.getMarker(photoUtils.latlng, ph);
        marker.openPopup();
        marker._popup.on('close', function () {
//console.log('close', arguments, ph);
            if (ph.arr.length === 0) {
                markers.removeLayer(marker);
            }
        });

        ph.marker = marker;
        ph.edit = true;
        photoUtils.selectItem(ph);

/*
        photoUtils.popup.setLatLng(photoUtils.latlng);
        photoUtils.popup.setContent(photoUtils.select);
        photoUtils.popup.openOn(map);
*/
        if (!ev.originalEvent.ctrlKey) {
            addDataControl.setActive(false);
        }
        //console.log('clickMap ', arguments);
    }
    function setItem(key, rec) {
        VK.api('storage.set', {
            key: key,
            value: rec ? JSON.stringify(rec) : '',
            user_id: mid,
            global: 1
        }, function(r) {
        //console.log('storage.set ', arguments);
        });
    }

    function chkAlbums(pt) {
        if (pt.response) {
            photoUtils.arr = pt.response;
            var div = L.DomUtil.create('div', ''),
                node = L.DomUtil.create('select', 'selectPhoto', div),
                bottom = L.DomUtil.create('div', '', div);

            bottom.innerHTML = 'Если необходимо добавьте новое фото в <a href="http://vk.com/albums' + mid + '" target="_blank">ВКонтакте</a>';
            photoUtils.select = div;
            node.setAttribute('size', 4);
            node.onchange = function(ev) {
                var ind = ev.target.selectedIndex;
                if (ind > 0) {
                    ind--;
                    map.removeLayer(photoUtils.popup);

                    var it = pt.response[ind],
                        img = L.DomUtil.create('img', '');

                    img.onload = function(ev) {
                        var popup = L.popup({minWidth: img.width});
                        var rec = {
                            owner_id: it.owner_id,
                            posted: Date.now(),
                            created: it.created,
                            src: it.src_big,
                            width: it.width,
                            height: it.height,
                            lat: photoUtils.latlng.lat,
                            lng: photoUtils.latlng.lng,
                            comments: it.comments,
                            text: it.text
                        };
//console.log('onchange', ind, it, rec);
                        popup.setContent(img);
                        photoUtils.curMarker = L.marker(photoUtils.latlng, {
                        }).addTo(map);
                        photoUtils.curMarker.bindPopup(popup);
                        photoUtils.curMarker.openPopup();
                        setItem(rec.owner_id + '_' + rec.posted, rec);
                    };
                    img.src = it.src_big;
                }
            };

            var opt = L.DomUtil.create('option', '', node);
            opt.text = 'Выбрать фото:';
            pt.response.map(function(it) {
                opt = L.DomUtil.create('option', '', node);
                //var img = L.DomUtil.create('img', '', opt);
                //img.src = it.src_small;
                opt.text = it.text || 'Без описания';
                return opt;
            });
        }
    }

    var addDataControl = new L.Control.gmxIcon({
            id: 'addData',
            togglable: true,
            regularImageUrl: 'img/camera.png',
            activeImageUrl: 'img/camera_a.png',
            title: 'Включить/Выключить режим добавления фото'
         })
         .on('statechange', function (ev) {
            //console.log('statechange', ev);
            var control = ev.target;
            if (control.options.isActive) {
                // VK.Api.call('photos.getAll', {
                    // owner_id: mid,
                    // count: 200,
                    // extended: 1,
                    // skip_hidden: 1,
                    // no_service_albums: 1
                 // }, chkAlbums
                // );
                map.on('click', clickMap);
                map._panes.tilePane.style.cursor = 'pointer';
            } else {
                map.off('click', clickMap);
                map._panes.tilePane.style.cursor = '';
            }
        }),
        curid = 1;
    function chkAllKeys(pt) {
//console.log('chkAllKeys ', pt.response);
        if (!addDataControl._map) map.addControl(addDataControl);
        if (pt.response) {
            VK.api('storage.get', {
                keys: pt.response.join(','),
                user_id: mid,
                global: 1
            }, function(res) {
                if (res.response) {
                    photoUtils.storage = res.response;
                    res.response.map(function (pt, i) {
                        if (pt.key === 'myKey' || !pt.value) { return; }
                        var json = JSON.parse(pt.value);
                        if (!json) { return; }
                        photoUtils.getMarker(json, pt, i);
/*
                        //var it = json.arr ? json.arr[0] : json;
                        var marker = L.marker([json.lat, json.lng], {
                                icon:  L.icon({
                                    iconUrl: 'img/video.png',
                                    iconRetinaUrl: 'img/videoRetina.png',
                                    iconSize: [32, 32],
                                    iconAnchor: [16, 16]
                                })
                            })
                            .bindPopup(L.popup({maxWidth: 10000}))
                            .on('click', function () {
                                    var json = JSON.parse(pt.value);
                                    photoUtils.selectItem({
                                        key: pt.key,
                                        arr: json.arr ? json.arr : [json],
                                        ind: i,
                                        lat: json.lat,
                                        lng: json.lng,
                                        edit: false,
                                        marker: marker
                                    });
                                }, marker)
                            .addTo(markers);
var tt = 1;*/
                    });
                }
            });
        }
    }
    function authInfo(response) {
        if (response.session) {
            //if (vkontakte._map) map.removeControl(vkontakte);
            mid = response.session.mid;
            VK.api('storage.getKeys', {
                user_id: mid,
                global: 1
             }, chkAllKeys
            );
//console.log('user: ' , response.session.mid, arguments);
        } else {
            console.log('not auth');
            markers.clearLayers();
            if (addDataControl._map) map.removeControl(addDataControl);
            //if (!vkontakte._map) map.addControl(vkontakte);
        }
    }
    // VK.Auth.getLoginStatus(authInfo);
    VK.Vars = {};
    VK.init(function() {
console.log('API initialization succeeded: ' , arguments);
         // API initialization succeeded
         // Your code here
        var parts = document.location.search.substr(1).split("&");
        for (var i=0; i<parts.length; i++) {
            var curr = parts[i].split('=');
            VK.Vars[curr[0]] = curr[1];
        }
        mid = VK.Vars.viewer_id;
        VK.api('storage.getKeys', {
            user_id: mid,
            global: 1
         }, chkAllKeys
        );

      }, function() {
console.log('API initialization failed: ' , arguments);
         // API initialization failed
         // Can reload page here
    }, '5.34');
    
};
})();
