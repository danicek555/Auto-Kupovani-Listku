// TODO zistit co je toto za ....
var zobrazMiesta = new Array();

if (typeof nMiestSektor != "undefined") {
  for (var i in nMiestSektor) {
    if (i >= 100036408 && i <= 100036504) zobrazMiesta[i] = 0;
  }
}

function getDocWidth() {
  var D = document;

  return Math.max(
    Math.max(D.body.scrollWidth, 0),
    Math.max(D.body.offsetWidth, 0),
    Math.max(D.body.clientWidth, 0)
  );
}

var maSVG = true;
var maObrazok = false; //1 bez vyzoru bez obrazku, 2 bez vyzoru s obrazkom, 3 bez obrazku s vyzorom, 4 s obrazkom s vyzorom, 5 svg
var zobrazKruh = lokalita == "cz" ? true : false;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 -960 960 960">
                    <path d="M399-247v-140h-59v-143q0-21 28.5-34t74.5-13q46 0 74.5 13t28.5 34v143.49h-59V-247h-88Zm44-359q-23.4 0-38.7-15.3Q389-636.6 389-660q0-23.4 15.3-38.7Q419.6-714 443-714q23.4 0 38.7 15.3Q497-683.4 497-660q0 23.4-15.3 38.7Q466.4-606 443-606Zm0 490q-151.98 0-257.99-106.11Q79-328.23 79-479.82q0-75.79 28.5-141.99Q136-688 185.5-737.5t115.64-78Q367.27-844 443-844q75.73 0 141.86 28.5Q651-787 700.5-737.5t78 115.64Q807-555.73 807-480v18l70-70 42 42-142 142-142-142 42-42 70 70v-18q0-125-89.5-214.5T443-784q-125 0-214.5 89.5T139-480q0 125 89.5 214.5T443-176q57 0 110.26-21.5Q606.52-219 647-256l43 43q-48 45-113 71t-134 26Z" fill="#ff0000"/>
                </svg>`;
const img = new Image();
img.src = `data:image/svg+xml;base64,${btoa(svg)}`;

//---------------
//----- DOM -----
//---------------
var _svg = null; // Element SVG
var _svg_miesta = null; // pojde prec
var _svg_kategorie = null;
var _nahlad = null;
var _canvas = null; // Doom element canvasu
var _hladisko = null; // DOM element hladisko - kontajner pre SVG a Canvas
var ctx = null; // Kontext platna na ktore vykreslujeme

var svg_miesta = null;
var div_canvas = null;
var sektor_pozicie = new Array();
//---------------

//--------------------------------
//----- Nastavenie spravania -----
//--------------------------------
var max_zoom = 20; // Maximalna pripustna hodnota zoomu
var min_zoom = 1;
var zoom_zobraz_canvas = 8.0; // Ak je zoom mensi ako tato hodnota, tak sa zobrazia miesta pomocou canvasu
var VS = 25; // Velkost polovice stvorceka ?
var VS2 = 24.2;

var zobrazujem_foto = true;
var zobrazujem_galeriu = null;
var cislo_fotografie = 0;
//--------------------------------

//------------------------------------------------
//----- Premenne urcujuce ze co je zobrazene -----
//------------------------------------------------
var zoom = 20; // Zakladna velicina zobrazenia, urcujezoom. 10 znamena ze objekty su zmensene 10 nasobne
var poz_x = 0; // Posun platna x
var poz_y = 0; // Posun platna y

var now_roz_x = 1000; // Aktualny rozmer svg v pixeloch
var now_roz_y = 1000;

var c_min_x = 0; // Stvorec s poziciami, co teraz vidime na platne
var c_max_x = 0;
var c_min_y = 0;
var c_max_y = 0;

var def_roz_x = 0; // Plocha ktoru vidi pouzivatel
var def_roz_y = 0;

//-------------------------------------------
//---- Pre hladisko s klasickym obrazkom ----
//-------------------------------------------
var Image_x = 0;
var Image_y = 0;
var zobrazIbaSektor = false;
var MiestaVZobrazenomSektore = new Array();
var __zobrazenySektor = null;
var __min_x = null;
var __max_x = null;
var __min_y = null;
var __max_y = null;

//-------------------------------------------
//----- Premenne urcujece ze co sa deje -----
//-------------------------------------------
var animacia = false;
var zobrazene_miesta = false;

//-------------------------------
//----- Statistiky a indexy -----
//-------------------------------
var pocet_miest = 0; // Pocet miest v hladisku
var H_min_x = 0; // Stvorec v ktorom sa nachadzaju vsetky miesta
var H_min_y = 0;

var canceled = false; // Nastavy sa na true ak opustame stranku

var Grid = new Array();
var SektorPocetVolnych = new Array(); // Pocet volnych miest pre sektory
var SektorPocetUvolnenych = new Array(); // Pocet miest ktore boli uvolnene do predaja
var KategoriePocetVolnych = new Array(); // Pocet volnych miest pre kategorie
var SektorKategoriePocetVolnych = new Array(); // Pocet volnych sektor -> Kategoria
SektorKategoriePocetUvolnenych = new Array();
var KategoriePocet = new Array();
var RozmerSektorov = new Array();
var PozicieIkon = new Array();
var SektorPoradie = new Array();
//-------------------------------

var image_foto_icon = new Image();
image_foto_icon.src =
  absoluteUri + "Content/Images/svghladisko/camera_hladisko.png";

var is_firefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;

var is_mobile = false;
if (
  navigator.userAgent.match(/Android/i) ||
  navigator.userAgent.match(/iPhone/i) ||
  navigator.userAgent.match(/iPad/i) ||
  navigator.userAgent.match(/iPod/i) ||
  navigator.userAgent.match(/BlackBerry/i) ||
  navigator.userAgent.match(/webOS/i)
) {
  is_mobile = true;
}

//is_mobile = true;

var is_touch = null;
function isTouchDevice() {
  if (is_touch == null) {
    try {
      document.createEvent("TouchEvent");
      is_touch = true;
      return true;
    } catch (e) {
      is_touch = false;
      return false;
    }
  } else {
    return is_touch;
  }
}

function reset_hladisko() {
  zobrazMiesta = new Array();
  max_zoom = 20;
  min_zoom = 1;
  zoom = 20;
  poz_x = 0;
  poz_y = 0;
  zobrazujem_foto = true;
  zobrazujem_galeriu = null;
  cislo_fotografie = 0;
  c_min_x = 0;
  c_max_x = 0;
  c_min_y = 0;
  c_max_y = 0;
  def_roz_x = 0;
  def_roz_y = 0;
  Image_x = 0;
  Image_y = 0;
  zobrazIbaSektor = false;
  MiestaVZobrazenomSektore = new Array();
  __zobrazenySektor = null;
  __min_x = null;
  __max_x = null;
  __min_y = null;
  __max_y = null;
  animacia = false;
  zobrazene_miesta = false;
  pocet_miest = 0;
  H_min_x = 0;
  H_min_y = 0;
  Grid = new Array();
  SektorPocetVolnych = new Array();
  KategoriePocetVolnych = new Array();
  SektorKategoriePocetVolnych = new Array();
  SektorKategoriePocetUvolnenych = new Array();
  KategoriePocet = new Array();
  RozmerSektorov = new Array();
  PozicieIkon = new Array();
  sektor_pozicie = new Array();
  window["v_all"] = new Array();
  window["r_all"] = new Array();

  ResetUI();
}

/*function fixed_mobile_bug()
{
    var poz = $("#hladisko-canvas-container").offset();
    if(poz.top < 100)
    {
        posun_canvasu_v_mobile_y = poz.top;
    }
    setTimeout("fixed_mobile_bug();", 250);
}
fixed_mobile_bug();*/

//-----------------------------------------------
//--- Inicializacia udalosti mysy popr. touch ---
//-----------------------------------------------
function __init_canvas_position__() {
  var rect = $("#canvas")[0].getBoundingClientRect();
  posun_canvasu_v_mobile_x = rect.left;
  posun_canvasu_v_mobile_y = rect.top;
}

function __init_events__() {
  //$('#hladisko-canvas-container')[0].style.border = '1px solid red';
  // Ak sa jedna o dotykove mobilne zariadenie
  if (is_mobile && isTouchDevice()) {
    __init_canvas_position__();

    // Tablet
    if ($(window).width() > 700) {
      /*var poz = $("#hladisko-canvas-container").offset();*/
      //var offset_modal_iframe = Number($("#modalHladisko .modal-dialog").css('top').replace("px", ""));
      //posun_canvasu_v_mobile_x = 32;
      //posun_canvasu_v_mobile_y = 220 + offset_modal_iframe;
      //$("#modalHladisko")[0].style.top = "-20px";
      //alert(offset_modal_iframe);
      //alert("Tablet:" + posun_canvasu_v_mobile_x + "|" + posun_canvasu_v_mobile_y);
    }

    /*$("#modalHladisko .modal-dialog")[0].style.marginTop = "5px";
        var poz = $("#hladisko-canvas-container").offset();
        if (poz.top > 100 && poz.top < 300) {
            posun_canvasu_v_mobile_x = poz.left;
            posun_canvasu_v_mobile_y = poz.top;

            //alert("tablet");
        }*/
    //alert(posun_canvasu_v_mobile_y + "|" + poz.top);
    //alert(poz.top);

    $("#hladisko-canvas-container").bind("touchmove", function (jQueryEvent) {
      jQueryEvent.preventDefault();
      var event = window.event;

      if (event.touches.length == 1)
        mobile_touch_move(event.touches[0].pageX, event.touches[0].pageY);
      else
        mobile_touch_move2(
          event.touches[0].pageX,
          event.touches[0].pageY,
          event.touches[1].pageX,
          event.touches[1].pageY
        );
    });

    $("#hladisko-canvas-container").bind("touchstart", function (jQueryEvent) {
      //jQueryEvent.preventDefault();
      var event = window.event;

      if (event.touches.length == 1) {
        mobile_touch_start(
          event.touches[0].pageX,
          event.touches[0].pageY,
          event.touches[0].clientX,
          event.touches[0].clientY
        );
        //alert(event.touches[0].pageX + "|" + event.touches[0].pageY + "|" + event.touches[0].clientX + "|" + event.touches[0].clientY);
      } else mobile_touch_start2(event.touches[0].pageX, event.touches[0].pageY, event.touches[1].pageX, event.touches[1].pageY);
    });

    $("#hladisko-canvas-container").bind("touchend", function (jQueryEvent) {
      //jQueryEvent.preventDefault();
      mobile_touch_end();
    });

    //$("#press-unpack").hide();
    //$("#zoom-panel").hide();
    povolena_odchylka = 2.0;
  } else {
    var scrollelement = document.getElementById("hladisko-canvas-container");

    //if (window.addEventListener) window.addEventListener('DOMMouseScroll', wheel, false);
    //window.onmousewheel = document.onmousewheel = wheel;
    if (scrollelement.addEventListener)
      scrollelement.addEventListener("DOMMouseScroll", wheel, false);
    //scrollelement.onmousewheel = document.onmousewheel = wheel;
    scrollelement.onmousewheel = wheel;

    document.onmousemove = document_onmousemove;
    document.onmouseup = document_onmouseup;
    document.onmousedown = document_onmousedown;
    document.onclick = document_onclick;
    document.onkeypress = document_keypressed;
    document.onkeydown = document_keydown;
    document.onkeyup = document_keyup;
  }

  $("body")[0].onresize = body_resize;
}

var poz_click_x = null;
var poz_click_y = null;
var time_click = null;

var debug = "";

function mobile_touch_start(x, y, ox, oy) {
  debug = "";

  GetMousePozition_mobile(ox, oy);
  poz_click_x = mouse_x;
  poz_click_y = mouse_y;

  //if (zobrazIbaSektor)
  //    alert("" + x + "|" + y + "|" + posun_canvasu_v_mobile_x + "|" + posun_canvasu_v_mobile_y + "|" + poz_click_x + "|" + poz_click_y);

  time_click = new Date().getTime();

  drag = true;
  GetMousePozition_notPosun_mobile(x, y); // Do pozicie neratame posun canvasu, lebo ten sa bude menit
  old_mouse_cord_x = mouse_x;
  old_mouse_cord_y = mouse_y;

  old_posun_X = poz_x;
  old_posun_Y = poz_y;
}

function mobile_touch_move(x, y) {
  if (drag) {
    GetMousePozition_notPosun_mobile(x, y);

    var mouse_dif_x = mouse_x - old_mouse_cord_x;
    var mouse_dif_y = mouse_y - old_mouse_cord_y;

    var new_poz_x = old_posun_X - mouse_dif_x;
    var new_poz_y = old_posun_Y - mouse_dif_y;

    //alert(new_poz_x + "|" + new_poz_y + "|" + old_posun_X + "|" + old_posun_Y);

    animacia = true;
    mobile_poz_x = new_poz_x;
    mobile_poz_y = new_poz_y;
    mobile_zoom = null;

    debug = debug + "\r\n" + Math.floor(new_poz_x) + "|" + x;
  }
}

function mobile_touch_end() {
  //alert(debug);
  //return;

  drag = false;
  drag2 = false;
  animacia = false;
  NastavZoom(null, mobile_poz_x_spracovavam, mobile_poz_y_spracovavam);

  var cas = new Date().getTime() - time_click;
  //alert("" + cas);

  if (cas < 250) {
    //alert("|" + poz_click_x + "," + poz_click_y);
    mouse_x = poz_click_x;
    mouse_y = poz_click_y;

    if (zobrazujem_foto == true && zobrazene_miesta) {
      for (var i in PozicieIkon) {
        if (PozicieIkon.hasOwnProperty(i)) {
          var x = Number(PozicieIkon[i][0]);
          var y = Number(PozicieIkon[i][1]);

          if (mouse_x > x && mouse_x < x + (96 / zoom) * 2 * zoom) {
            if (mouse_y > y && mouse_y < y + (96 / zoom) * 2 * zoom) {
              Zobraz_galeriu(i.substring(1));
              return;
            }
          }
        }
      }
    }

    if (zobrazene_miesta == true && animacia == false) {
      // Klikat na miesta sa da len ked su miesta zobrazene a zaroven neprebieha animacia
      //alert("|" + poz_click_x + "," + poz_click_y);

      if (get_miesto_on_x_y(poz_click_x, poz_click_y)) {
        // Zistime miesto na ktore sa kliklo
        //alert("" + poz_click_x + "," + poz_click_y + "," + ukazujem_na_miesto);
        if (m[ukazujem_na_miesto[0]][1] != 2) {
          OnSeat_click(ukazujem_na_miesto); // Zavolame funkciu definovanu v performancesvg.aspx
        }
      } else {
        //alert("click na prazdnu plochu");
      }
    }
  }
}

//----- UDALOST DVOCH PRSTOV
var drag = false;
var drag2 = false;
var old_mouse_cord_x1 = 0;
var old_mouse_cord_y1 = 0;
var old_mouse_cord_x2 = 0;
var old_mouse_cord_y2 = 0;
var old_zoom_touch = 0;
var absolute_x = 0;
var absolute_y = 0;

function mobile_touch_start2(x1, y1, x2, y2) {
  drag2 = true;
  drag = false;
  GetMousePozition_notPosun_mobile(x1, y1);
  old_mouse_cord_x1 = mouse_x;
  old_mouse_cord_y1 = mouse_y;

  GetMousePozition_notPosun_mobile(x2, y2);
  old_mouse_cord_x2 = mouse_x;
  old_mouse_cord_y2 = mouse_y;

  GetMousePozition_mobile_absolute(x1, y1);
  var _x1 = mouse_x;
  var _y1 = mouse_y;
  GetMousePozition_mobile_absolute(x2, y2);
  var _x2 = mouse_x;
  var _y2 = mouse_y;

  absolute_x = (x1 - x2) / 2 + x2;
  absolute_y = (y1 - y2) / 2 + y2;

  old_posun_X = poz_x;
  old_posun_Y = poz_y;
  old_zoom_touch = zoom;
}

function mobile_touch_move2(x1, y1, x2, y2) {
  if (drag2) {
    GetMousePozition_notPosun_mobile_oldzoom(x1, y1, zoom);
    var mouse_poz_x1 = mouse_x;
    var mouse_poz_y1 = mouse_y;
    var mouse_dif_x1 = mouse_x - old_mouse_cord_x1;
    var mouse_dif_y1 = mouse_y - old_mouse_cord_y1;

    GetMousePozition_notPosun_mobile_oldzoom(x2, y2, zoom);
    var mouse_poz_x2 = mouse_x;
    var mouse_poz_y2 = mouse_y;
    var mouse_dif_x2 = mouse_x - old_mouse_cord_x2;
    var mouse_dif_y2 = mouse_y - old_mouse_cord_y2;

    // Zmenu zoomu vyratame ako zmenu pomeru vzdialenosti dvoch prstov
    var vzdialenost_pred = Math.sqrt(
      (old_mouse_cord_x1 - old_mouse_cord_x2) *
        (old_mouse_cord_x1 - old_mouse_cord_x2) +
        (old_mouse_cord_y1 - old_mouse_cord_y2) *
          (old_mouse_cord_y1 - old_mouse_cord_y2)
    );
    var vzdialenost_teraz = Math.sqrt(
      (mouse_poz_x1 - mouse_poz_x2) * (mouse_poz_x1 - mouse_poz_x2) +
        (mouse_poz_y1 - mouse_poz_y2) * (mouse_poz_y1 - mouse_poz_y2)
    );
    mobile_zoom = zoom * (vzdialenost_pred / vzdialenost_teraz);

    mobile_poz_x =
      old_posun_X + absolute_x * old_zoom_touch - absolute_x * mobile_zoom;
    mobile_poz_y =
      old_posun_Y +
      (absolute_y * old_zoom_touch - absolute_y * mobile_zoom) / 2;

    /*GetMousePozition_notPosun_mobile_oldzoom(x1, y1, mobile_zoom);
        var mouse_dif_x1 = mouse_x - old_mouse_cord_x1;
        var mouse_dif_y1 = mouse_y - old_mouse_cord_y1;


        GetMousePozition_notPosun_mobile_oldzoom(x2, y2, mobile_zoom);
        var mouse_dif_x2 = mouse_x - old_mouse_cord_x1;
        var mouse_dif_y2 = mouse_y - old_mouse_cord_y1;


        // Zmenu posunu vyratame podla toho,ako sa posunul prvy prst
        mobile_poz_x = (old_posun_X - ((mouse_dif_x1 + mouse_dif_x2) / 2));
        mobile_poz_y = (old_posun_Y - ((mouse_dif_y1 + mouse_dif_y2) / 2));*/

    animacia = true;

    //var new_poz_x = new_poz_x  + (new_poz_x * zoom) - (new_poz_x * new_zoom);
    //var new_poz_y = new_poz_y  + (new_poz_y * zoom) - (new_poz_y * new_zoom);

    //mobile_poz_x = new_poz_x;
    //mobile_poz_y = new_poz_y;

    //mobile_poz_x = old_posun_X;
    //mobile_poz_y = old_posun_Y;

    //document.getElementById('info-box-obsah').innerHTML = document.getElementById('info-box-obsah').innerHTML + Math.floor(mobile_zoom) + "|" + Math.floor(vzdialenost_pred) + "|" + Math.floor(vzdialenost_teraz) + "<br/>";
  }
}

var mobile_poz_x = null;
var mobile_poz_y = null;
var mobile_zoom = null;

var mobile_poz_x_spracovavam = null;
var mobile_poz_y_spracovavam = null;
var mobile_zoom_spracovavam = null;

var mobile_casovac = 0;

function Zmen_poz_mobile_asynchron() {
  if (drag) {
    if (mobile_poz_x != null && mobile_poz_y != null) {
      if (
        mobile_poz_x != mobile_poz_x_spracovavam ||
        mobile_poz_y != mobile_poz_y_spracovavam
      ) {
        mobile_poz_x_spracovavam = mobile_poz_x;
        mobile_poz_y_spracovavam = mobile_poz_y;

        NastavZoom(null, mobile_poz_x_spracovavam, mobile_poz_y_spracovavam);
        mobile_casovac = 0;

        setTimeout("Zmen_poz_mobile_asynchron();", 100);
      } else {
        mobile_casovac++; // Ratame kolko desatin sekundy sa nic nezmenilo

        if (mobile_casovac == 3) {
          animacia = false;
          NastavZoom(null, mobile_poz_x_spracovavam, mobile_poz_y_spracovavam);
        }

        setTimeout("Zmen_poz_mobile_asynchron();", 100);
      }
    } else {
      setTimeout("Zmen_poz_mobile_asynchron();", 100);
    }
  }

  if (drag2) {
    if (mobile_poz_x != null && mobile_poz_y != null && mobile_zoom != null) {
      if (
        mobile_poz_x != mobile_poz_x_spracovavam &&
        mobile_poz_y != mobile_poz_y_spracovavam &&
        mobile_zoom != mobile_zoom_spracovavam
      ) {
        mobile_poz_x_spracovavam = mobile_poz_x;
        mobile_poz_y_spracovavam = mobile_poz_y;
        mobile_zoom_spracovavam = mobile_zoom;

        NastavZoom(
          mobile_zoom,
          mobile_poz_x_spracovavam,
          mobile_poz_y_spracovavam
        );
        mobile_casovac = 0;

        setTimeout("Zmen_poz_mobile_asynchron();", 100);
      } else {
        mobile_casovac++; // Ratame kolko desatin sekundy sa nic nezmenilo

        if (mobile_casovac == 3) {
          animacia = false;
          NastavZoom(
            mobile_zoom,
            mobile_poz_x_spracovavam,
            mobile_poz_y_spracovavam
          );
        }

        setTimeout("Zmen_poz_mobile_asynchron();", 100);
      }
    } else {
      setTimeout("Zmen_poz_mobile_asynchron();", 100);
    }
  }

  if (drag == false && drag2 == false)
    setTimeout("Zmen_poz_mobile_asynchron();", 100);
}
Zmen_poz_mobile_asynchron();

//var sirka_header = $("#modal-control-body").height() + $("#next-control-body").height();

var posun_canvasu_v_mobile_x = 15;
var posun_canvasu_v_mobile_y = 150;

function GetMousePozition_mobile(x, y) {
  var _x = x - posun_canvasu_v_mobile_x;
  var _y = y - posun_canvasu_v_mobile_y;

  //alert("" + _x + "|" + _y);

  mouse_x = poz_x + _x * zoom;
  mouse_y = poz_y + _y * zoom;
}

function GetMousePozition_mobile_absolute(x, y) {
  var _x = x - posun_canvasu_v_mobile_x;
  var _y = y - posun_canvasu_v_mobile_y;

  mouse_x = _x;
  mouse_y = _y;
}

function GetMousePozition_notPosun_mobile(x, y) {
  mouse_x = x * zoom;
  mouse_y = y * zoom;
}

function GetMousePozition_notPosun_mobile_oldzoom(x, y, oldzoom) {
  mouse_x = x * oldzoom;
  mouse_y = y * oldzoom;
}

function TFP_INIT() {
  if (isnull(window["TFP_Price"]) == false && window["TFP_Price"] != null) {
    for (var i in k_all) {
      k_all[i][2] = window["TFP_Price"];
    }
  }
}

//-------------------------------------------
//--- Inicializacia hladiska ktore ma SVG ---
//-------------------------------------------
function JaviskoSVG_init() {
  maSVG = true;
  maObrazok = false;
  TFP_INIT();
  ui_init();
  QuickPurcharseInit();

  $("#zoom-panel").show();
  $("#press-unpack").show();

  Decompres();
  PocetVolnych();
  __init_svg_sektory();
  CreateElement();

  GeneratePolygon();
  GenerateGrid();
  GenerateSektor();

  NastavDefaultZoom();
  nastav_pocet_volnych_v_svg();
  zisti_pozicie_foto_icon();

  //zosvetli_svg_sektory();
  //DrawMiestaCanvas();
  //Draw_miesta_svg();

  __init_events__();
  ZistiPoradieMiestVHladisku();
}
//-------------------------------------------

//-----------------------------------------------
//--- Inicializacia hladiska ktore ma Obrazok ---
//-----------------------------------------------
function JaviskoObrazokInit() {
  TFP_INIT();
  ui_init();
  QuickPurcharseInit();

  maSVG = false;
  maObrazok = true;
  SkryNahlad();
  $("#ZobrazCeleHladisko_obrazok_link").addClass("hidden");
  $("#ZobrazCeleHladisko_obrazok_link2").addClass("hidden-xs");

  if (g_performance.Venue.VenueViewType == "NoLayoutHasImage") {
    GenerujVyzor_preinit();
    GenerujVyzor();
    Decopres2();
  } else {
    Decompres();
  }

  PocetVolnych();
  CreateElementObrazok();
  GeneratePolygon();
  GenerateGrid();
  GenerateSektor();
  GetRozmerHladisko();
  NastavDefaultZoom();

  __init_events__();

  //$(document).ready(function (e) {
  //    $('img[usemap]').rwdImageMaps();
  //});

  ZobrazRadInit();
  ZistiPoradieMiestVHladisku();
}

function CreateElementObrazok() {
  _svg = null;
  _svg_miesta = null;
  _canvas = document.getElementById("canvas");
  _hladisko = document.getElementById("hladisko-canvas-container");
  ctx = _canvas.getContext("2d");
}

function GenerateMap(p) {
  var pomer = 0;

  if (typeof p == "undefined" || p == null)
    pomer = Image_x / g_performance.Venue.Image_x;
  else pomer = 1.0 / p;

  var HTML = new Array();

  for (var i in g_performance.Venue.ImageMaps) {
    if (g_performance.Venue.ImageMaps.hasOwnProperty(i)) {
      var map = g_performance.Venue.ImageMaps[i];

      var coords = map.Map.split(",");
      for (var c in coords)
        coords[c] = "" + Math.floor(Number(coords[c]) * pomer);

      HTML.push(
        "<area style='outline:none;' shape='" +
          map.TypeMap +
          "' alt='Sektor - " +
          map.SectorName +
          "' coords='" +
          coords.join(",") +
          "' href='javascript:ZobrazIbaSektor(" +
          map.ID_Sector +
          ");' title='Sektor - " +
          map.SectorName +
          "' >"
      );
    }
  }

  return HTML.join("");
}

var _id_iba_sektor_zobrazenu = null;

function ZobrazIbaSektor(id_sektor) {
  _id_iba_sektor_zobrazenu = id_sektor;

  if (
    typeof nMiestSektor[id_sektor] != "undefined" &&
    nMiestSektor[id_sektor] != null &&
    nMiestSektor[id_sektor] == 1
  ) {
    ZobrazitNMiest(id_sektor);
    return;
  }

  //alert("ZobrazIbaSektor");
  zobrazIbaSektor = true;
  zobrazene_miesta = true;

  if (!is_mobile) ZavryNMiest();

  if (g_performance.ZobrazPercenta == true) {
    var uvolnenych = 0;
    var volnych = 0;

    for (var idk in SektorKategoriePocetUvolnenych[id_sektor]) {
      uvolnenych += SektorKategoriePocetUvolnenych[id_sektor][idk];
    }
    for (var idk in SektorKategoriePocetVolnych[id_sektor]) {
      volnych += SektorKategoriePocetVolnych[id_sektor][idk];
    }

    var percento = Math.round(volnych / (uvolnenych / 100.0));
    var percentoStr = percento + "%";
    document.getElementById("zoznam-volnych-miest-text").innerHTML =
      s_all[id_sektor] +
      (g_performance.ShowHiddenSeats ? " ( " + percentoStr + " )" : "") +
      "<i class='fa fa-chevron-down pull-right'></i>";
  } else {
    document.getElementById("zoznam-volnych-miest-text").innerHTML =
      s_all[id_sektor] +
      (g_performance.ShowHiddenSeats
        ? " ( " + SektorPocetVolnych[id_sektor] + " )"
        : "") +
      "<i class='fa fa-chevron-down pull-right'></i>";
  }

  $(".zoznam-sektorov").addClass("hidden");
  $("#ZobrazCeleHladisko_obrazok_link").removeClass("hidden");
  $("#ZobrazCeleHladisko_obrazok_link2").removeClass("hidden-xs");

  if (
    typeof nMiestSektor[id_sektor] != "undefined" &&
    nMiestSektor[id_sektor] != null &&
    nMiestSektor[id_sektor] == 1
  ) {
    if (SektorPocetVolnych[id_sektor] > 0) {
      ZobrazitNMiest(id_sektor);
    }
    return;
  }

  $("#canvas")[0].style.display = "";
  $("#imgMap")[0].style.display = "none";

  MiestaVZobrazenomSektore = new Array();
  /*var min_x = 1000000;
    var min_y = 1000000;
    var max_x = 0;
    var max_y = 0;*/
  __zobrazenySektor = id_sektor;
  for (var i in m_all) {
    // prechadzame vsetky miesta, tie ktore sa nachadzaju v oznacenom sektore vlozime do pola a ratame poziciu sektora
    if (m_all.hasOwnProperty(i)) {
      if (m_all[i][7] == id_sektor) {
        MiestaVZobrazenomSektore[m_all[i][0]] = m_all[i];
        /*if (min_x > m_all[i][4])
                    min_x = m_all[i][4];
                if (min_y > m_all[i][5])
                    min_y = m_all[i][5];
                if (max_x < m_all[i][4])
                    max_x = m_all[i][4];
                if (max_y < m_all[i][5])
                    max_y = m_all[i][5];*/
      }
    }
  }

  GetRozmerSektor();
  var new_zoom = CalculateMinMaxZoom();
  if (new_zoom < 2) new_zoom = 2;

  var posun_centruj_x = (new_zoom * def_roz_x - (H_max_x - H_min_x)) / 2;
  var posun_centruj_y = (new_zoom * def_roz_y - (H_max_y - H_min_y)) / 4;

  max_zoom = new_zoom;
  NastavZoom(
    new_zoom,
    H_min_x - posun_centruj_x,
    H_min_y - posun_centruj_y,
    false
  );

  default_zoom = new_zoom;
  default_x = H_min_x - posun_centruj_x;
  default_y = H_min_y - posun_centruj_y;

  ZobrazNahlad();

  /*var rozmer_x = max_x - min_x;
    var rozmer_y = max_y - min_y;
    var rp_x = cx * (1.0 / zoom);
    var rp_y = cy * (1.0 / zoom);
    var pridavok_x = (rp_x - rozmer_x) / 2;
    var pridavok_y = (rp_y - rozmer_y) / 2;

    Posun_min_x = -max_x;
    Posun_max_x = Posun_min_x + (max_x - min_x) + rp_x;
    posunX = -(min_x - 200);
    Posun_min_y = -max_y;
    Posun_max_y = Posun_min_y + (max_y - min_y) + rp_y;
    posunY = -(min_y - 100);

    __min_x = min_x;
    __max_x = max_x;
    __min_y = min_y;
    __max_y = max_y;*/

  //Draw();

  // Pre mobili zisti kde v pici je canvas
  __init_canvas_position__();
}

function ZobrazCeleHladisko_obrazok() {
  zobrazene_miesta = false;

  if (!is_mobile) ZavryNMiest();

  document.getElementById("zoznam-volnych-miest-text").innerHTML =
    lang["lbZoznamVolnychMiest"] +
    ' <i class="fa fa-chevron-down pull-right"></i>';
  $("#ZobrazCeleHladisko_obrazok_link").addClass("hidden");
  $("#ZobrazCeleHladisko_obrazok_link2").addClass("hidden-xs");

  $("#canvas")[0].style.display = "none";
  $("#imgMap")[0].style.display = "";

  zobrazIbaSektor = false;
  SkryNahlad();
}

function GetRozmerSektor() {
  H_min_x = 1000000;
  H_max_x = 0;
  H_min_y = 1000000;
  H_max_y = 0;
  for (var key in MiestaVZobrazenomSektore) {
    if (MiestaVZobrazenomSektore.hasOwnProperty(key)) {
      i = MiestaVZobrazenomSektore[key];
      if (i[1] != "|N|") {
        if (i[4] < H_min_x) H_min_x = i[4];
        if (i[4] > H_max_x) H_max_x = i[4];
        if (i[5] < H_min_y) H_min_y = i[5];
        if (i[5] > H_max_y) H_max_y = i[5];
      }
    }
  }
}

function GetRozmerHladisko() {
  H_max_x = 0;
  H_max_y = 0;

  for (var i in m_all) {
    if (m_all.hasOwnProperty(i)) {
      /*if (min_x > m_all[i][4])
                min_x = m_all[i][4];
            if (min_y > m_all[i][5])
                min_y = m_all[i][5];*/
      if (H_max_x < m_all[i][4]) H_max_x = m_all[i][4];
      if (H_max_y < m_all[i][5]) H_max_y = m_all[i][5];
    }
  }
}

function CalculateMinMaxZoom() {
  var dx = H_max_x - H_min_x + 400;
  var dy = H_max_y - H_min_y + 400;

  //var zoom1 = def_roz_x / dx;
  //var zoom2 = def_roz_y / dy;

  var zoom1 = dx / def_roz_x;
  var zoom2 = dy / def_roz_y;

  return (zoom1 >= zoom2 ? zoom1 : zoom2) * 1.2;
}

function Decopres2() {
  var buff = new Array();
  buff = s_all;
  s_all = new Array();

  for (var i in buff) {
    s_all[buff[i][0]] = buff[i][1];
    sektor_pozicie[buff[i][0]] = [buff[i][1], buff[i][2], buff[i][3]];
  }

  buff = m_all;
  m_all = new Array();
  for (var i in buff) {
    m_all[buff[i][0]] = buff[i];
  }

  buff = m;
  m = new Array();
  for (var i in buff) {
    m[buff[i][0]] = buff[i];
  }

  for (var i in m_all) {
    // Ak sanachadza v m_all ale nenachadza sa v m tak do m slahneme ako miesto v tempe
    if (typeof m[i] == "undefined" || m[i] == null) m[i] = [i, 2];
  }

  if (typeof PovoleneSektory != "undefined") {
    for (var i in m) {
      if (m_all[i] != null) {
        var id_sektor = m_all[i][7];
        if (isnull(PovoleneSektory[id_sektor])) m[i][1] = 2;
      }
    }
  }

  if (typeof PovoleneSektoryKategorie != "undefined") {
    var b = new Array();
    for (var id_sektor in s_all) {
      if (b[id_sektor] == null) b[id_sektor] = new Array();
      for (var id_kategoria in k_all) {
        b[id_sektor][id_kategoria] = false;
      }
    }
    for (var is = 0; is < PovoleneSektoryKategorie.length; is++) {
      var settings = PovoleneSektoryKategorie[is];

      if (settings.id_sektor == 0 && settings.id_kategoria == 0) {
        for (var idsektor in b) {
          for (var idkategoria in b[id_sektor]) {
            b[idsektor][idkategoria] = true;
          }
        }
      }
      if (settings.id_sektor != 0 && settings.id_kategoria == 0) {
        for (var idsektor in b) {
          for (var idkategoria in b[id_sektor]) {
            if (idsektor == settings.id_sektor) b[idsektor][idkategoria] = true;
          }
        }
      }
      if (settings.id_sektor == 0 && settings.id_kategoria != 0) {
        for (var idsektor in b) {
          for (var idkategoria in b[id_sektor]) {
            if (idkategoria == settings.id_kategoria)
              b[idsektor][idkategoria] = true;
          }
        }
      }
      if (settings.id_sektor != 0 && settings.id_kategoria != 0) {
        for (var idsektor in b) {
          for (var idkategoria in b[id_sektor]) {
            if (
              idkategoria == settings.id_kategoria &&
              idsektor == settings.id_sektor
            )
              b[idsektor][idkategoria] = true;
          }
        }
      }
    }

    for (var i in m) {
      if (m_all[i] != null) {
        var id_sektor = m_all[i][7];
        var id_kategoria = m_all[i][3];

        if (b[id_sektor][id_kategoria] == false) m[i][1] = 2;
      }
    }
  }
}

function SkryNahlad() {
  $("#zoom-panel").hide();
  $("#press-unpack").hide();
  $("#press-unpack").removeClass("unpack").addClass("pack");
  $("#miniHladisko-box").hide();
  $(".zoom-control").addClass("hidden");
}

function ZobrazNahlad() {
  $("#zoom-panel").show();
  $("#press-unpack").show();
  $(".zoom-control").removeClass("hidden");
}
//-----------------------------------------------

//------------------------------------------------------------------------------
//---- Inicializacia hladiska ktore nema svg obrazok a ani obycajny obrazok ----
//------------------------------------------------------------------------------
function JaviskoSmallinit() {
  TFP_INIT();
  ui_init();
  QuickPurcharseInit();

  // skrijeme nahlad
  SkryNahlad();
  $("#ZobrazCeleHladisko_obrazok_link").addClass("hidden");
  $("#ZobrazCeleHladisko_obrazok_link2").addClass("hidden-xs");
  $(".zoom-control").removeClass("hidden");

  maSVG = false;
  maObrazok = false;

  if (g_performance.Venue.VenueViewType == "NoLayoutNoImage") {
    GenerujVyzor_preinit();
    GenerujVyzor();
    Decopres2();
  } else {
    Decompres();
  }

  PocetVolnych();
  CreateElementObrazok();

  GeneratePolygon();
  GenerateGrid();
  GenerateSektor();
  GetRozmerHladisko();
  NastavDefaultZoom();
  zobrazene_miesta = true;

  __init_events__();
  ZobrazRadInit();

  ZistiPoradieMiestVHladisku();
}

var SektorZobrazRad = new Array();

function ZobrazRadInit() {
  for (var ids in s_all) {
    if (s_all.hasOwnProperty(ids)) {
      SektorZobrazRad[ids] = false;
    }
  }

  for (var idm in m_all) {
    if (m_all.hasOwnProperty(idm)) {
      var miesto = m_all[idm];

      if (miesto[2] != "") SektorZobrazRad[miesto[7]] = true;
    }
  }
}
//-------------------------------------------------------------------------------

var s_all_inverse = new Array(); // Sektory ale kluc je nazov a hodnota je id

//--- Idcka sa posielaju zakomprimovane
function Decompres() {
  var c = 0;
  for (var i in m) {
    if (m.hasOwnProperty(i)) {
      var item = m[i];
      item[0] = item[0] + c;
      c = item[0];
    }
  }

  var _ids = 0;
  for (var i = 0; i < s_all.length; i++) {
    _ids = _ids + s_all[0];
    SektorPoradie[_ids] = i;
  }

  c = 0;
  var buff = s_all;
  s_all = new Array();
  for (var i in buff) {
    if (buff.hasOwnProperty(i)) {
      item = buff[i];
      c = c + item[0];
      s_all[c] = item[1];
      sektor_pozicie[c] = [item[1], item[2], item[3]];
    }
  }
  buff = null;

  var c0 = 0;
  c3 = 0;
  c4 = 0;
  c5 = 0;
  c6 = 0;
  c7 = 0;
  c8 = 0;

  for (var i in m_all) {
    if (m_all.hasOwnProperty(i)) {
      m_all[i][0] = m_all[i][0] + c0;
      c0 = m_all[i][0];
      m_all[i][3] = m_all[i][3] + c3;
      c3 = m_all[i][3];
      m_all[i][4] = m_all[i][4] + c4;
      c4 = m_all[i][4];
      m_all[i][5] = m_all[i][5] + c5;
      c5 = m_all[i][5];
      m_all[i][6] = m_all[i][6] + c6;
      c6 = m_all[i][6];
      m_all[i][7] = m_all[i][7] + c7;
      c7 = m_all[i][7];
      //m_all[i][8] = m_all[i][8] + c8;
      //c8 = m_all[i][8];
    }
  }

  buff = m_all;
  m_all = new Array();
  for (var i in buff) {
    if (buff.hasOwnProperty(i)) {
      m_all[buff[i][0]] = buff[i];
    }
  }

  buff = m;
  m = new Array();
  for (var i in buff) {
    if (buff.hasOwnProperty(i)) {
      m[buff[i][0]] = buff[i];
    }
  }

  for (var i in m_all) {
    // Ak sanachadza v m_all ale nenachadza sa v m tak do m slahneme ako miesto v tempe
    if (m_all.hasOwnProperty(i)) {
      if (typeof m[i] == "undefined" || m[i] == null) m[i] = [i, 2];
    }
  }

  for (var i in s_all) {
    if (s_all.hasOwnProperty(i)) {
      s_all_inverse[s_all[i]] = i;
    }
  }

  if (typeof PovoleneSektory != "undefined") {
    for (var i in m) {
      if (m.hasOwnProperty(i)) {
        if (m[i][1] != 3) {
          var id_sektor = m_all[i][7];
          if (isnull(PovoleneSektory[id_sektor])) m[i][1] = 2;
        }
      }
    }
  }

  if (typeof PovoleneSektoryKategorie != "undefined") {
    var b = new Array();
    for (var id_sektor in s_all) {
      if (b[id_sektor] == null) b[id_sektor] = new Array();
      for (var id_kategoria in k_all) {
        b[id_sektor][id_kategoria] = false;
      }
    }
    for (var is = 0; is < PovoleneSektoryKategorie.length; is++) {
      var settings = PovoleneSektoryKategorie[is];

      if (settings.id_sektor == 0 && settings.id_kategoria == 0) {
        for (var idsektor in b) {
          for (var idkategoria in b[id_sektor]) {
            b[idsektor][idkategoria] = true;
          }
        }
      }
      if (settings.id_sektor != 0 && settings.id_kategoria == 0) {
        for (var idsektor in b) {
          for (var idkategoria in b[id_sektor]) {
            if (idsektor == settings.id_sektor) b[idsektor][idkategoria] = true;
          }
        }
      }
      if (settings.id_sektor == 0 && settings.id_kategoria != 0) {
        for (var idsektor in b) {
          for (var idkategoria in b[id_sektor]) {
            if (idkategoria == settings.id_kategoria)
              b[idsektor][idkategoria] = true;
          }
        }
      }
      if (settings.id_sektor != 0 && settings.id_kategoria != 0) {
        for (var idsektor in b) {
          for (var idkategoria in b[id_sektor]) {
            if (
              idkategoria == settings.id_kategoria &&
              idsektor == settings.id_sektor
            )
              b[idsektor][idkategoria] = true;
          }
        }
      }
    }

    for (var i in m) {
      if (m_all[i] != null) {
        var id_sektor = m_all[i][7];
        var id_kategoria = m_all[i][3];

        if (b[id_sektor][id_kategoria] == false) m[i][1] = 2;
      }
    }
  }
}

// Zisti pocet volnych miest +  urci farby pre sedadla
function PocetVolnych() {
  // Normalizacia farieb
  //if (zobrazKruh) {
  //    for (var i in k_all) {
  //        k_all[i][0] = NormalizujFarbu(k_all[i][0]);
  //    }
  //}

  for (var i in k_all) {
    k_all[i].push(zosvetliRGBFarbu(k_all[i][0], 0.8));
    k_all[i].push(zosvetliRGBFarbu(k_all[i][0], 0.8));
    //k_all[i].push("#000000");
    //k_all[i].push("#777777");
  }

  for (var i in s_all) {
    SektorPocetVolnych[i] = 0;
    SektorPocetUvolnenych[i] = 0;
    SektorKategoriePocetVolnych[i] = new Array();
    SektorKategoriePocetUvolnenych[i] = new Array();
    RozmerSektorov[i] = [1000000, 1000000, 0, 0]; // x_min, y_min, x_max, y_max
  }

  for (var i in k_all) {
    KategoriePocetVolnych[i] = 0;
    KategoriePocet[i] = 0;
  }

  for (var i in m_all) {
    var M = m[i];
    var sedadlo = m_all[i];
    var id_sektor = sedadlo[7];
    var id_kat = sedadlo[3];
    KategoriePocet[id_kat] = KategoriePocet[id_kat] + 1;

    if (
      (lokalita == "cz" && sedadlo[1] != "") ||
      (lokalita != "cz" && sedadlo[1] != "" && sedadlo[1] != "|N|")
    ) {
      if (sedadlo[4] < RozmerSektorov[sedadlo[7]][0])
        RozmerSektorov[sedadlo[7]][0] = sedadlo[4];
      if (sedadlo[4] > RozmerSektorov[sedadlo[7]][2])
        RozmerSektorov[sedadlo[7]][2] = sedadlo[4];
      if (sedadlo[5] < RozmerSektorov[sedadlo[7]][1])
        RozmerSektorov[sedadlo[7]][1] = sedadlo[5];
      if (sedadlo[5] > RozmerSektorov[sedadlo[7]][3])
        RozmerSektorov[sedadlo[7]][3] = sedadlo[5];
    }

    if (SektorKategoriePocetVolnych[sedadlo[7]][id_kat] == null)
      SektorKategoriePocetVolnych[sedadlo[7]][id_kat] = 0;

    if (SektorKategoriePocetUvolnenych[sedadlo[7]][id_kat] == null)
      SektorKategoriePocetUvolnenych[sedadlo[7]][id_kat] = 0;

    SektorKategoriePocetUvolnenych[sedadlo[7]][id_kat] =
      SektorKategoriePocetUvolnenych[sedadlo[7]][id_kat] + 1;

    if (M[1] < 3) {
      SektorPocetUvolnenych[sedadlo[7]] = SektorPocetUvolnenych[sedadlo[7]] + 1;
    }

    if (M[1] == 0) {
      SektorPocetVolnych[sedadlo[7]] = SektorPocetVolnych[sedadlo[7]] + 1;
      KategoriePocetVolnych[id_kat] = KategoriePocetVolnych[id_kat] + 1;
      SektorKategoriePocetVolnych[sedadlo[7]][id_kat] += 1;

      //M.push(k_all[sedadlo[3]][0]);
      //M.push(zosvetliRGBFarbu(k_all[sedadlo[3]][0], -0.2));
    }
    if (M[1] == 1) {
      /*if (typeof (k_all[sedadlo[3]]) == 'undefined') {
                M.push("#000000");
                M.push("#000000");
            } else {
                M.push(zosvetliRGBFarbu(k_all[sedadlo[3]][0], 0.8));
                M.push(zosvetliRGBFarbu(k_all[sedadlo[3]][0], -0.2));
            }*/
    }
    if (M[1] == 2) {
      /*if (typeof (k_all[sedadlo[3]]) == 'undefined') {
                M.push("#000000"); M.push("#000000");
            } else {
                //M.push(zosvetliRGBFarbu(k_all[sedadlo[3]][0], 0.8)); M.push(zosvetliRGBFarbu(k_all[sedadlo[3]][0], -0.2));
                M.push("#AAAAAA"); M.push("#AAAAAA");
            }*/
    }
  }

  if (typeof XL_nseat != "undefined") {
    for (var i in XL_nseat) {
      if (SektorPocetVolnych[i] != null) SektorPocetVolnych[i] = XL_nseat[i];
      if (SektorKategoriePocetVolnych[i] != null) {
        for (var y in SektorKategoriePocetVolnych[i]) {
          if (SektorKategoriePocetVolnych[i].hasOwnProperty(y)) {
            SektorKategoriePocetVolnych[i][y] = XL_nseat[i];
          }
        }
      }
    }
  }
}

function NormalizujFarbu(rgb) {
  var RH = rgb.substring(1, 3);
  var GH = rgb.substring(3, 5);
  var BH = rgb.substring(5, 7);

  var R = parseInt(RH, 16);
  var G = parseInt(GH, 16);
  var B = parseInt(BH, 16);

  var hsl = rgbToHsl(R, G, B);

  var S = hsl[1] * 100.0;
  var L = hsl[2] * 100.0;

  if (S > 90) S = 90;

  var kons = 40.0;
  var hranica = 100.0 - kons;

  if (L > hranica) {
    var rozdiel = L - hranica;
    var pomer = rozdiel / kons;
    pomer = 1 - pomer;

    L = L - rozdiel - pomer * (kons / 3.0);

    if (S > 80) S = 80;
  }

  hsl[1] = S / 100.0;
  hsl[2] = L / 100.0;

  var RGB = hslToRgb(hsl[0], hsl[1], hsl[2]);
  RGB[0] = Math.floor(RGB[0]);
  RGB[1] = Math.floor(RGB[1]);
  RGB[2] = Math.floor(RGB[2]);

  return (
    "#" +
    (RGB[0].toString(16).length == 1
      ? "0" + RGB[0].toString(16)
      : RGB[0].toString(16)) +
    (RGB[1].toString(16).length == 1
      ? "0" + RGB[1].toString(16)
      : RGB[1].toString(16)) +
    (RGB[2].toString(16).length == 1
      ? "0" + RGB[2].toString(16)
      : RGB[2].toString(16))
  );
}

function zosvetliRGBFarbu(rgb, koeficient) {
  var RH = rgb.substring(1, 3);
  var GH = rgb.substring(3, 5);
  var BH = rgb.substring(5, 7);

  var R = parseInt(RH, 16);
  var G = parseInt(GH, 16);
  var B = parseInt(BH, 16);

  var hsl = rgbToHsl(R, G, B);
  if (koeficient >= 0) hsl[2] = hsl[2] + (1.0 - hsl[2]) * koeficient;
  else hsl[2] = hsl[2] - hsl[2] * -koeficient;

  var RGB = hslToRgb(hsl[0], hsl[1], hsl[2]);
  RGB[0] = Math.floor(RGB[0]);
  RGB[1] = Math.floor(RGB[1]);
  RGB[2] = Math.floor(RGB[2]);

  return (
    "#" +
    (RGB[0].toString(16).length == 1
      ? "0" + RGB[0].toString(16)
      : RGB[0].toString(16)) +
    (RGB[1].toString(16).length == 1
      ? "0" + RGB[1].toString(16)
      : RGB[1].toString(16)) +
    (RGB[2].toString(16).length == 1
      ? "0" + RGB[2].toString(16)
      : RGB[2].toString(16))
  );
}

function rgbToHsl(r, g, b) {
  (r /= 255), (g /= 255), (b /= 255);
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0;
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l;
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r * 255, g * 255, b * 255];
}

var povinne_sluzby = new Array();

function sort_sektor_kat(a, b) {
  if (SektorPoradie[a.id_sector] != null && SektorPoradie[b.id_sector]) {
    if (SektorPoradie[a.id_sector] < SektorPoradie[b.id_sector]) return -1;
    if (SektorPoradie[a.id_sector] > SektorPoradie[b.id_sector]) return 1;
  }

  if (a.Nazov > b.Nazov) return 1;
  if (a.Nazov < b.Nazov) return -1;

  if (a.Cena < b.Cena) return -1;
  return 1;
}

function sort_kat(a, b) {
  if (a.Cena > b.Cena) return 1;
  if (a.Cena < b.Cena) return -1;

  if (a.Nazov < b.Nazov) return -1;
  return 1;
}

//--- Indexuje miesta podla polohy
//---Index je vzdy oblast o velkosti 500x500
function GenerateGrid() {
  for (var key in m_all) {
    if (m_all.hasOwnProperty(key)) {
      var miesto = m_all[key];

      var x = miesto[4];
      var y = miesto[5];

      getGridPosition(x, y);
      var gkey = grid_x + "_" + grid_y;

      if (typeof Grid[grid_x] == "undefined" || Grid[grid_x] == null)
        Grid[grid_x] = new Array();
      if (
        typeof Grid[grid_x][grid_y] == "undefined" ||
        Grid[grid_x][grid_y] == null
      )
        Grid[grid_x][grid_y] = new Array();

      Grid[grid_x][grid_y].push(Number(key));
    }
  }
}

var grid_x = 0;
var grid_y = 0;
function getGridPosition(x, y) {
  grid_x = Math.floor(x / 500);
  grid_y = Math.floor(y / 500);
}

var grid_x1 = 0;
var grid_x2 = 0;
var grid_y1 = 0;
var grid_y2 = 0;
function getRectOnGrid(gx, gy) {
  grid_x1 = gx * 500;
  grid_y1 = gy * 500;
  grid_x2 = grid_x1 + 500;
  grid_y2 = grid_y1 + 500;
}

//--- Na zaklade rozlisenia obrazovky nastavi zoom tak aby bolo vidiet cele hladisko
//--- t.j. nezobrazia sa posuvniky

var default_zoom = 0;
var default_x = 0;
var default_y = 0;

function NastavDefaultZoom() {
  VelkostCanvas();
  setTimeout("Velkost_Canvasu_oprav();", 100);

  document
    .getElementById("hladisko-canvas-container")
    .setAttribute(
      "style",
      "width:" + def_roz_x + "px;height:" + def_roz_y + "px;padding:0;margin:0"
    );

  document.getElementById("canvas").setAttribute("width", def_roz_x + "px");
  document.getElementById("canvas").setAttribute("height", def_roz_y + "px");

  if (maSVG) {
    document.getElementById("_svg").setAttribute("width", def_roz_x + "px");
    document.getElementById("_svg").setAttribute("height", def_roz_y + "px");
  }
  if (maObrazok) {
    if (
      (g_performance.Venue.ForceResizeImage == 1 &&
        g_performance.Venue.Image_y > def_roz_y &&
        is_mobile == false &&
        g_performance.Venue.Image_y > g_performance.Venue.Image_x * 1.3) ||
      (g_performance.Venue.ForceResizeImage == 33 && is_mobile == false)
    ) {
      document
        .getElementById("imgMap")
        .setAttribute("width", g_performance.Venue.Image_x + "px");
      document
        .getElementById("imgMap")
        .setAttribute("height", g_performance.Venue.Image_y + "px");

      if (window.location.href.indexOf("iframe") == -1)
        document
          .getElementById("imgMap")
          .setAttribute("style", "margin-top: 30px");

      $("#hladisko-canvas-container").css("overflow", "auto");

      Image_x = g_performance.Venue.Image_x;
      Image_y = g_performance.Venue.Image_y;
      $(document.getElementsByName("stage")[0]).html(GenerateMap());

      return;
    }

    var pomer_x = (def_roz_x - 30) / g_performance.Venue.Image_x;
    var pomer_y = (def_roz_y - 30) / g_performance.Venue.Image_y;
    var pomer = pomer_x < pomer_y ? pomer_x : pomer_y;

    // ak je nastavene nezmensovat zmensi aspon tak aby bol iba jeden scroll bar
    if (g_performance.Venue.ForceResizeImage == 3 && is_mobile == false) {
      pomer = pomer_x < pomer_y ? pomer_y : pomer_x;
      $("#hladisko-canvas-container").css("overflow", "auto");
    }

    if (pomer > 2.0) pomer = 2.0;

    document
      .getElementById("imgMap")
      .setAttribute("width", g_performance.Venue.Image_x * pomer + "px");
    document
      .getElementById("imgMap")
      .setAttribute("height", g_performance.Venue.Image_y * pomer + "px");
    if (window.location.href.indexOf("iframe") == -1)
      document
        .getElementById("imgMap")
        .setAttribute("style", "margin-top: 30px");

    Image_x = g_performance.Venue.Image_x * pomer;
    Image_y = g_performance.Venue.Image_y * pomer;
    $(document.getElementsByName("stage")[0]).html(GenerateMap());

    // $('#ZobrazCeleHladisko_obrazok_link')[0].style.left = (($('#hladisko-canvas-container').width() - $('#ZobrazCeleHladisko_obrazok_link').width()) - 50) + 'px';
  }

  var zoom1 = H_max_x / def_roz_x; // Vypocitame idealny zoom pre kazdu os, a vyberieme vacsi
  var zoom2 = H_max_y / (def_roz_y - 20);
  zoom = zoom1 >= zoom2 ? zoom1 : zoom2;

  if (zoom < 1.5) zoom = 1.5; // Aj ked je hladisko moc male, pod zoom 1.5 nejdeme. Vtedy ma 1 sedadlo 33x33px

  max_zoom = zoom;

  //if (maSVG && zoom < 8.1)
  //    zoom = 8.1;
  if (maSVG && max_zoom < 9) max_zoom = 9;

  if (maSVG) {
    if (isnull($("#_svg").attr("maxzoom")) == false) {
      max_zoom = Number($("#_svg").attr("maxzoom"));
      zoom = zoom > max_zoom ? max_zoom : zoom;
    }
  }

  if (maSVG == false && maObrazok == false) {
    var p_x = -(def_roz_x * zoom - (H_max_x - H_min_x)) / 2.1;
    NastavZoom(zoom, p_x);
    default_zoom = zoom;
    default_x = p_x;
    default_y = 0;
  } else {
    NastavZoom(zoom);
    default_zoom = zoom;
    default_x = 0;
    default_y = 0;
  }
}

//--- Nastavi zoom a posun canvasu
//--- zoom - nasobok zvacsenia canvasu (ak je null, nemenime hodnotu)
//--- new_poz_x - posun canvasu v osi x (ak je null, nemenime hodnotu)
//--- new_poz_y - posun canvasu v osi y (ak je null, nemenime hodnotu)
//--- nemen posuvnik - ak je nastavene na true funkcia neposunie posuvnik v nahlade
function NastavZoom(new_zoom, new_poz_x, new_poz_y, nemen_posuvnik) {
  if (new_zoom != null) {
    // Ak sa zmenil zoom
    zoom = new_zoom;
    now_roz_x = def_roz_x * zoom; // Vyratame rozmer platna
    now_roz_y = def_roz_y * zoom;
  }

  if (new_poz_x != null)
    // Ak sa zmenila aj pozicia
    poz_x = new_poz_x;

  if (new_poz_y != null) poz_y = new_poz_y;

  if (poz_x < H_min_x - def_roz_x * 0.9 * zoom)
    poz_x = H_min_x - def_roz_x * 0.9 * zoom;
  if (poz_x > H_max_x - (def_roz_x * zoom) / 10)
    poz_x = H_max_x - (def_roz_x * zoom) / 10;

  if (poz_y < H_min_y - def_roz_y * 0.9 * zoom)
    poz_y = H_min_y - def_roz_y * 0.9 * zoom;
  if (poz_y > H_max_y - (def_roz_y * zoom) / 10)
    poz_y = H_max_y - (def_roz_y * zoom) / 10;

  if (now_roz_x > H_max_x && poz_x == 0) {
    poz_x = -((now_roz_x - H_max_x) / 2);
  }

  c_min_x = poz_x; // Vyratame oblast ktoru vidi pouzivatel
  c_min_y = poz_y;
  c_max_x = poz_x + def_roz_x * zoom;
  c_max_y = poz_y + def_roz_y * zoom;

  if (maSVG)
    _svg.setAttribute(
      "viewBox",
      "" + c_min_x + " " + c_min_y + " " + now_roz_x + " " + now_roz_y
    );

  PrekresliCanvas(); // Prekreslime canvas
}

//--- Inicializuje svg doom objekty
//--- eventy, opacity vlastnost
function __init_svg_sektory() {
  var svg_sektory = document.getElementById("_svg_sektory");

  for (var i in svg_sektory.childNodes) {
    if (svg_sektory.childNodes.hasOwnProperty(i)) {
      var elem = svg_sektory.childNodes[i];
      if (elem.nodeName == "path") {
        if (elem.id.indexOf("disabled") == -1) {
          if (elem.hasAttribute("stroke"))
            elem.setAttribute("stroke-orig", elem.getAttribute("stroke"));

          elem.setAttribute("onclick", "svg_sektor_click(evt)");

          if (elem.id.substring(0, 7) == "Sektor ") {
            var sektor_nazov = elem.id.substring(7);

            if (
              typeof s_all_inverse[sektor_nazov] != "undefined" &&
              s_all_inverse[sektor_nazov] != null
            ) {
              var __id_sektor__ = s_all_inverse[sektor_nazov];
              if (
                typeof nMiestSektor[__id_sektor__] != "undefined" &&
                nMiestSektor[__id_sektor__] != null &&
                nMiestSektor[__id_sektor__] == 1
              )
                elem.setAttribute(
                  "onclick",
                  "ZobrazitNMiest(" + __id_sektor__ + ")"
                );
            }
          }

          elem.setAttribute("onmousemove", "svg_sektor_move(evt)");
          elem.setAttribute("onmouseout", "svg_sektor_out(evt)");

          elem.setAttribute("style", "cursor:pointer;pointer-events:all");
        }
      }
      if (elem.nodeName == "text") {
        elem.setAttribute("style", "pointer-events:none");
      }
    }
  }

  var svgkat = document.getElementById("_svg_kategorie");
  for (var i in svgkat.childNodes) {
    if (svgkat.childNodes.hasOwnProperty(i)) {
      var elem = svgkat.childNodes[i];
      if (elem.nodeName == "path") {
        elem.style.fillOpacity = "0.7";
        elem.style.stroke = "#ffffff";
        elem.style.strokeWidth = "0";

        elem.setAttribute("fill-opacity", 0.7);
        elem.setAttribute("stroke", "#ffffff");
        elem.setAttribute("stroke-width", 0);
      }
    }
  }
}

function nastav_pocet_volnych_v_svg() {
  // Zosedne sektory take ktore ani neboli uvolenene do predaja
  var svgkat = document.getElementById("_svg_kategorie");

  for (var k in s_all) {
    if (s_all.hasOwnProperty(k)) {
      if (SektorPocetUvolnenych[k] == 0 && s_all[k] != "") {
        var nazovSektoru = s_all[k];

        for (var i in svgkat.childNodes) {
          if (svgkat.childNodes.hasOwnProperty(i)) {
            var elem = svgkat.childNodes[i];

            if (lokalita == "sk") {
              if (
                elem.nodeName == "path" &&
                (elem.id == "Kategoria_" + nazovSektoru ||
                  elem.id == "Kategoria " + nazovSektoru)
              ) {
                elem.setAttribute("fill", "silver");
              }
            } else {
              if (
                elem.nodeName == "path" &&
                (elem.id.indexOf("Kategoria_" + nazovSektoru) != -1 ||
                  elem.id.indexOf("Kategoria " + nazovSektoru) != -1)
              ) {
                elem.setAttribute("fill", "silver");
              }
            }
          }
        }
      }
    }
  }

  var svg_sektory = document.getElementById("_svg_sektory");

  for (var i in svg_sektory.childNodes) {
    if (svg_sektory.childNodes.hasOwnProperty(i)) {
      var elem = svg_sektory.childNodes[i];
      if (elem.nodeName == "text") {
        var text = elem.textContent;

        /*for(var i in s_all){
                    if(s_all[i] == text) {
                        if(SektorPocetVolnych[i] == 0) {
                            elem.setAttribute('fill', 'silver');
                        }
                    }
                }*/

        if (text[0] == "(") {
          var nazov_sektoru = text.substring(1, text.length - 1);

          for (var i in s_all) {
            if (s_all.hasOwnProperty(i)) {
              if (s_all[i] == nazov_sektoru) {
                if (g_performance.ShowHiddenSeats == true)
                  elem.textContent = "(" + SektorPocetVolnych[i] + ")";
                else elem.textContent = "";
                //if(SektorPocetVolnych[i] == 0)
                //    elem.textContent = "NEDOSTUPNÉ";
                break;
              }
            }
          }
        }
      }
    }
  }
}

function zisti_pozicie_foto_icon() {
  var svg_foto = document.getElementById("_svg_foto");

  if (svg_foto != null) {
    for (var i in svg_foto.childNodes) {
      if (svg_foto.childNodes.hasOwnProperty(i)) {
        var elem = svg_foto.childNodes[i];

        if (elem.nodeName == "text") {
          var text = elem.textContent.trim();
          var x = elem.attributes.x.nodeValue;
          var y = elem.attributes.y.nodeValue - (lokalita == "cz" ? 180 : 0);
          PozicieIkon[text] = [x, y];
        }
      }
    }
  }
}

//--- Vola sa v pripade, ze je hladisko priblizene natolko, ze sa zobrazuju miesta
//--- Odstrania sa udalosti a sektory sa zosvetlia
function zosvetli_svg_sektory() {
  var svg_sektory = document.getElementById("_svg_sektory");
  //svg_sektory.style.display = 'none';

  for (var i in svg_sektory.childNodes) {
    if (svg_sektory.childNodes.hasOwnProperty(i)) {
      var elem = svg_sektory.childNodes[i];
      if (elem.nodeName == "path" || elem.nodeName == "rect") {
        elem.setAttribute("style", "cursor:default;pointer-events:none");
        elem.setAttribute("stroke-width", 0);
        elem.setAttribute("stroke", "#000000");

        elem.style.cursor = "default";
        elem.style.pointerEvents = "none";
        elem.style.strokeWidth = "0";
        elem.style.stroke = "#000000";
      }
      if (elem.nodeName == "text") {
        elem.setAttribute("style", "display:none");
        elem.style.display = "none";
      }
    }
  }

  var svgkat = document.getElementById("_svg_kategorie");
  for (var i in svgkat.childNodes) {
    if (svgkat.childNodes.hasOwnProperty(i)) {
      var elem = svgkat.childNodes[i];
      if (elem.nodeName == "path" || elem.nodeName == "rect") {
        elem.style.fillOpacity = "0.15";
        elem.style.stroke = "#aaaaaa";
        elem.style.strokeWidth = "0";
        elem.style.strokeOpacity = "1.0";

        elem.setAttribute("fill-opacity", 0.15);
        elem.setAttribute("stroke", "#AAAAAA");
        elem.setAttribute("stroke-width", 0);
        elem.setAttribute("stroke-opacity", 1.0);
      }
    }
  }

  var svg_grafika2 = document.getElementById("_svg_grafika_2");
  if (typeof "svg_grafika2" != "undefined" && svg_grafika2 != null)
    svg_grafika2.style.display = "inline";

  /*
    for (var i in svg_sektory.childNodes) {
        var elem = svg_sektory.childNodes[i];
        if (elem.nodeName == 'path') {
            elem.setAttribute('fill-opacity', 0.25);
            elem.setAttribute('onmousemove', ';');
            elem.setAttribute('onmouseout', ';');
            elem.setAttribute('onclick', ';');
        }
    }
    
    var svgkat = document.getElementById('_svg_kategorie');
    for (var i in svgkat.childNodes) {
        var elem = svgkat.childNodes[i];
        if (elem.nodeName == 'path') {
            elem.style.opacity = 0.25;
        }
    }*/
}

//--- Vola sa v pripade, ze je hladisko natolko vzdialene, ze sa nezobrazuju miesta
//--- Sektory ziskaju predvolenu farbu, + sa im priradia udalosti
function stmavni_svg_sektory() {
  var svg_sektory = document.getElementById("_svg_sektory");
  svg_sektory.style.display = "inline";

  for (var i in svg_sektory.childNodes) {
    if (svg_sektory.childNodes.hasOwnProperty(i)) {
      var elem = svg_sektory.childNodes[i];
      if (elem.nodeName == "path") {
        if (elem.getAttribute("type") == "text") {
        } else {
          var stroke = "#FFFFFF";
          if (elem.hasAttribute("stroke-orig"))
            stroke = elem.getAttribute("stroke-orig");

          elem.setAttribute("style", "cursor:pointer;pointer-events:all");
          elem.setAttribute("stroke-width", 20);
          elem.setAttribute("stroke", stroke);

          elem.style.cursor = "pointer";
          elem.style.pointerEvents = "all";
          elem.style.strokeWidth = "20";
          elem.style.stroke = stroke;
        }
      }
      if (elem.nodeName == "text") {
        elem.setAttribute("style", "display:inline;pointer-events:none");
        elem.style.display = "inline";
        elem.style.pointerEvents = "none";
      }
    }
  }

  var svgkat = document.getElementById("_svg_kategorie");
  for (var i in svgkat.childNodes) {
    if (svgkat.childNodes.hasOwnProperty(i)) {
      var elem = svgkat.childNodes[i];
      if (elem.nodeName == "path") {
        elem.style.fillOpacity = "0.7";
        elem.style.stroke = "#ffffff";
        elem.style.stroke = "#ffffff";

        elem.setAttribute("fill-opacity", 0.7);
        elem.setAttribute("stroke", "#ffffff");
        elem.setAttribute("stroke-width", 0);
      }
    }
  }

  var svg_grafika2 = document.getElementById("_svg_grafika_2");
  if (typeof "svg_grafika2" != "undefined" && svg_grafika2 != null)
    svg_grafika2.style.display = "none";
}

function CreateElement() {
  _svg = document.getElementById("_svg");
  _svg_miesta = document.getElementById("_svg_miesta");
  _canvas = document.getElementById("canvas");
  _hladisko = document.getElementById("hladisko-canvas-container");
  ctx = _canvas.getContext("2d");
}

//-------------------
//----- CANVAS ------
//-------------------
function Nastav_Zobrazujem_miesta() {
  if (zobrazene_miesta == false) {
    zosvetli_svg_sektory();
    _canvas.style.zIndex = 1000;
    _svg.style.zIndex = 10;
    zobrazene_miesta = true;
  }
}
function Nastav_nezobrazujem_miesta() {
  if (zobrazene_miesta == true) {
    stmavni_svg_sektory();
    _canvas.style.zIndex = 10;
    _svg.style.zIndex = 1000;
    ctx.clearRect(0, 0, def_roz_x, def_roz_y);
    zobrazene_miesta = false;
  }
}

function PrekresliCanvas() {
  if (maSVG) {
    if (animacia == true) {
      if (zoom <= zoom_zobraz_canvas) {
        Nastav_Zobrazujem_miesta();
        DrawMiestaCanvas_Visible();
        DrawFotoIcon();
      } else {
        Nastav_nezobrazujem_miesta();
      }
    } else {
      if (zoom <= zoom_zobraz_canvas) {
        Nastav_Zobrazujem_miesta();
        DrawMiestaCanvas_Visible();
        DrawFotoIcon();
      } else {
        Nastav_nezobrazujem_miesta();
      }
    }
  }

  if (maObrazok) {
    DrawMiestaCanvas_Visible();
  }

  if (maSVG == false && maObrazok == false) {
    DrawMiestaCanvas_Visible();
  }
}

function DrawFotoIcon() {
  for (var i in PozicieIkon) {
    if (PozicieIkon.hasOwnProperty(i)) {
      ctx.drawImage(
        image_foto_icon,
        (PozicieIkon[i][0] - poz_x) / zoom,
        (PozicieIkon[i][1] - poz_y) / zoom,
        (96 / zoom) * 2,
        (96 / zoom) * 2
      );
    }
  }
}

// Vykresli miesta ktore je vidiet
function DrawMiestaCanvas_Visible() {
  if (zobrazIbaSektor == false) {
    getGridPosition(c_min_x, c_min_y);
    var grid_min_x = grid_x;
    var grid_min_y = grid_y;
    getGridPosition(c_max_x, c_max_y);
    var grid_max_x = grid_x;
    var grid_max_y = grid_y;

    /**/ //ctx.clearRect(poz_x/zoom-200, poz_y/zoom-200, (poz_x/zoom)+def_roz_x, (poz_y/zoom)+def_roz_y);

    ctx.clearRect(0, 0, def_roz_x, def_roz_y);

    for (var x = grid_min_x; x <= grid_max_x; x++) {
      for (var y = grid_min_y; y <= grid_max_y; y++) {
        DrawMiestaGrid(x, y);
      }
    }

    // Vykresli cisla radov a nazvy sektorov
    if (typeof v_all != "undefined") {
      for (var key in v_all) {
        if (v_all.hasOwnProperty(key)) {
          DrawVector(ctx, v_all[key]);
        }
      }
    }

    drawFont_rad(null);
  } else {
    ctx.clearRect(0, 0, def_roz_x, def_roz_y);

    for (var i in MiestaVZobrazenomSektore) {
      if (MiestaVZobrazenomSektore.hasOwnProperty(i)) {
        DrawSedadlo(MiestaVZobrazenomSektore[i]);
      }
    }

    if (g_performance.Venue.VenueViewType == "HasLayoutHasImage") {
      drawFont_rad(_id_iba_sektor_zobrazenu);
    } else {
      if (typeof v_all != "undefined") {
        for (var key in v_all) {
          if (v_all.hasOwnProperty(key)) {
            if (v_all[key][7] == __zobrazenySektor) DrawVector(ctx, v_all[key]);
          }
        }
      }
    }
  }
  //setTimeout('DrawMiestaCanvas_Invisible()', 10);
}

// Vykresli miesta ktore nie je vidiet TODO NEPOUZIVA SA
function DrawMiestaCanvas_Invisible() {
  getGridPosition(c_min_x, c_min_y);
  var grid_min_x = grid_x;
  var grid_min_y = grid_y;
  getGridPosition(c_max_x, c_max_y);
  var grid_max_x = grid_x;
  var grid_max_y = grid_y;

  /**/ //ctx.clearRect(0, 0, H_max_x, H_max_y);
  DrawMiestaCanvas_Visible();

  for (var gx in Grid) {
    if (Grid.hasOwnProperty(gx)) {
      for (var gy in Grid[gx]) {
        if (Grid[gx].hasOwnProperty(gy)) {
          if (
            !(
              gx >= grid_min_x &&
              gx <= grid_max_x &&
              gy >= grid_min_y &&
              gy <= grid_max_y
            )
          )
            DrawMiestaGrid(gx, gy);
        }
      }
    }
  }
}

// Vykresli miesta v gride
function DrawMiestaGrid_sektor(gx, gy) {
  if (
    typeof Grid[gx] != "undefined" &&
    Grid[gx] != null &&
    typeof Grid[gx][gy] != "undefined" &&
    Grid[gx][gy] != null
  ) {
    // TODO urobit grid tak aby mal vsetky polozky, bez nutnosti kontroly
    var pole = Grid[gx][gy];
    for (var i in pole) {
      miesto = m_all[pole[i]];

      // Vykreslujeme len v oblasti platna, nikde inde
      if (
        miesto[4] >= c_min_x &&
        miesto[4] <= c_max_x &&
        miesto[5] >= c_min_y &&
        miesto[5] <= c_max_y
      ) {
        if (zobrazIbaSektor == false) {
          DrawSedadlo(miesto);
        } else {
          if (MiestaVZobrazenomSektore[miesto[0]] != null) DrawSedadlo(miesto);
        }
      }
    }
  }
}

function DrawMiestaGrid(gx, gy) {
  if (
    typeof Grid[gx] != "undefined" &&
    Grid[gx] != null &&
    typeof Grid[gx][gy] != "undefined" &&
    Grid[gx][gy] != null
  ) {
    // TODO urobit grid tak aby mal vsetky polozky, bez nutnosti kontroly
    var pole = Grid[gx][gy];
    for (var i in pole) {
      if (pole.hasOwnProperty(i)) {
        miesto = m_all[pole[i]];

        // Vykreslujeme len v oblasti platna, nikde inde
        if (
          miesto[4] >= c_min_x &&
          miesto[4] <= c_max_x &&
          miesto[5] >= c_min_y &&
          miesto[5] <= c_max_y
        )
          DrawSedadlo(miesto);
      }
    }
  }
}

var posun_text_1_x = -8;
var posun_text_1_y = 10;
var posun_text_2_x = -15;
var posun_text_2_y = 10;
var font_size_1 = 26;
var font_size_2 = 26;

var farba_stav_2_3 = "#aaaaaa";
var premaz_miesto = false;
var premaz_miesto2 = false;

var zvyraznene_miesta = new Array();

function DrawSedadlo(sedadlo) {
  if (typeof lokalita != "undefined" && lokalita == "cz" && sedadlo[1] == "") {
    return;
  } else {
    if (sedadlo[1] == "|N|") return;
  }

  // nezobrazovat nmiestne sedadla - ale iba ak ma obrazok alebo svg
  if (maSVG == true || maObrazok == true) {
    var id_sektor = sedadlo[7];
    if (nMiestSektor[id_sektor] == 1) return;
  }

  var kat = k_all[sedadlo[3]];

  if (typeof k_nezobrazovat[sedadlo[3]] != "undefined")
    if (k_nezobrazovat[sedadlo[3]] != null)
      if (k_nezobrazovat[sedadlo[3]] == 0) return;

  var stav = m[sedadlo[0]][1];
  var temp =
    typeof oznacene[sedadlo[0]] != "undefined" && oznacene[sedadlo[0]] == 1
      ? true
      : false;
  var polygon = sedadlo[8];
  var ukazujem_na_toto =
    ukazujem_na_miesto != null && sedadlo[0] == ukazujem_na_miesto[0];

  if (temp == false && g_performance.Resale.Seats[sedadlo[0]]) {
    var velkost = (50.0 / zoom) * 1.3;
    var velkost2 = velkost / 2;

    ctx.drawImage(
      img,
      (sedadlo[4] - poz_x) / zoom - velkost2,
      (sedadlo[5] - poz_y) / zoom - velkost2,
      velkost,
      velkost
    );
    return;
  }

  // Zobrazenie stvorca / kruhu
  if (zobrazKruh == false) {
    if (temp == false) {
      var farba = kat[0];
      if (stav == 1) farba = kat[5];
      if (stav == 2 || stav == 3) farba = kat[4];

      ctx.fillStyle = farba;

      /*if (zoom <= 2.5) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#000000";
            }
            if (zoom > 2.5 && zoom <= 4) {
                ctx.lineWidth = 1;
                ctx.strokeStyle = "#000000";
            }*/

      ctx.beginPath();
      ctx.moveTo((polygon[0] - poz_x) / zoom, (polygon[1] - poz_y) / zoom);
      ctx.lineTo((polygon[2] - poz_x) / zoom, (polygon[3] - poz_y) / zoom);
      ctx.lineTo((polygon[4] - poz_x) / zoom, (polygon[5] - poz_y) / zoom);
      ctx.lineTo((polygon[6] - poz_x) / zoom, (polygon[7] - poz_y) / zoom);
      ctx.lineTo((polygon[0] - poz_x) / zoom, (polygon[1] - poz_y) / zoom);
      ctx.closePath();

      ctx.fill();

      /*if (zoom <= 4) {
               ctx.stroke();
            }*/
    } else {
      var polygon = sedadlo[8];
      ctx.fillStyle = "black";

      ctx.beginPath();
      ctx.moveTo((polygon[0] - poz_x) / zoom, (polygon[1] - poz_y) / zoom);
      //ctx.lineTo((polygon[2] - poz_x) / zoom, (polygon[3] - poz_y) / zoom);
      ctx.lineTo((polygon[4] - poz_x) / zoom, (polygon[5] - poz_y) / zoom);
      ctx.lineTo((polygon[6] - poz_x) / zoom, (polygon[7] - poz_y) / zoom);
      ctx.lineTo((polygon[0] - poz_x) / zoom, (polygon[1] - poz_y) / zoom);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "yellow";

      ctx.beginPath();
      ctx.moveTo((polygon[0] - poz_x) / zoom, (polygon[1] - poz_y) / zoom);
      ctx.lineTo((polygon[2] - poz_x) / zoom, (polygon[3] - poz_y) / zoom);
      ctx.lineTo((polygon[4] - poz_x) / zoom, (polygon[5] - poz_y) / zoom);
      //ctx.lineTo((polygon[6] - poz_x) / zoom, (polygon[7] - poz_y) / zoom);
      ctx.lineTo((polygon[0] - poz_x) / zoom, (polygon[1] - poz_y) / zoom);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    if (temp == false) {
      var farba = kat[0];
      if (stav == 1) farba = kat[5];
      if (stav >= 2) farba = kat[4];
      if (SektorPocetUvolnenych[id_sektor] == 0) farba = "#eeeeee";

      /*if (premaz_miesto) {
                console.log("premaz miesto:" + sedadlo[0]);
                var sx = Math.round((sedadlo[4] - poz_x) / zoom);
                var sy = Math.round((sedadlo[5] - poz_y) / zoom);
                var r = Math.round((37 / zoom))*2;
                ctx.clearRect(sx - r / 2, sy - r / 2, r, r);

                premaz_miesto = false;
                getGridPosition(sedadlo[4], sedadlo[5]);
                premaz_miesto2 = true;
                DrawMiestaGrid_sektor(grid_x, grid_y);
                premaz_miesto2 = false;
            }

            if (premaz_miesto2) {
                var sx = Math.round((sedadlo[4] - poz_x) / zoom);
                var sy = Math.round((sedadlo[5] - poz_y) / zoom);
                var r = Math.round((27 / zoom)) * 2;
                ctx.clearRect(sx - r / 2, sy - r / 2, r, r);
            }*/

      ctx.fillStyle = farba;
      ctx.beginPath();

      ctx.arc(
        (sedadlo[4] - poz_x) / zoom,
        (sedadlo[5] - poz_y) / zoom,
        25 / zoom,
        0,
        2 * Math.PI
      );
      ctx.closePath();

      ctx.fill();
    } else {
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(
        (sedadlo[4] - poz_x) / zoom,
        (sedadlo[5] - poz_y) / zoom,
        25 / zoom,
        0,
        2 * Math.PI
      );
      ctx.closePath();
      ctx.fill();

      var farba = "#FFD700";
      ctx.fillStyle = farba;
      ctx.beginPath();
      ctx.arc(
        (sedadlo[4] - poz_x) / zoom,
        (sedadlo[5] - poz_y) / zoom,
        23 / zoom,
        0,
        2 * Math.PI
      );
      ctx.closePath();
      ctx.fill();

      /*ctx.fillStyle = "black";
            ctx.beginPath(); 
            ctx.arc((sedadlo[4] - poz_x) / zoom, (sedadlo[5] - poz_y) / zoom, 25 / zoom, 0.7 * Math.PI, 1.7 * Math.PI);
            ctx.closePath();

            ctx.fill();

            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.arc((sedadlo[4] - poz_x) / zoom, (sedadlo[5] - poz_y) / zoom, 25 / zoom, 1.7 * Math.PI, 0.7 * Math.PI);
            ctx.closePath();

            ctx.fill();*/
    }
  }

  // Zobrazenie popisu
  if (zobrazKruh == false) {
    //if (animacia == false) // zakomentovane. pri velkom hladisku sa neprekreslili cisla
    //{

    if (farba != "#FFFFFF" && temp == false) {
      if (lokalita == "cz") ctx.fillStyle = "black";
      else ctx.fillStyle = "white";
    } else {
      if (temp) ctx.fillStyle = "red";
      else ctx.fillStyle = "black";
    }

    var text = sedadlo[1].replace(" ", "").replace(" ", "");
    var _text = sedadlo[1];
    if (_text[_text.length - 1] == " ")
      _text = _text.replace(" ", "").replace(" ", "");

    if (_text.length <= 2) {
      if (temp == false)
        ctx.font = "bold " + Math.floor(35 / zoom) + "px Arial";
      else ctx.font = "bold " + Math.floor(35 / zoom) + "px Arial";

      if (text.length == 2)
        ctx.fillText(
          text,
          (sedadlo[4] - 20 - poz_x) / zoom,
          (sedadlo[5] + 12 - poz_y) / zoom
        );
      if (text.length == 1)
        ctx.fillText(
          text,
          (sedadlo[4] - 10 - poz_x) / zoom,
          (sedadlo[5] + 12 - poz_y) / zoom
        );
    } else {
      if (text.length < 4) {
        if (temp == false)
          ctx.font = "bold " + Math.floor(20 / zoom) + "px Arial";
        else ctx.font = "bold " + Math.floor(20 / zoom) + "px Arial";
      } else {
        if (temp == false)
          ctx.font = "bold " + Math.floor(15 / zoom) + "px Arial";
        else ctx.font = "bold " + Math.floor(15 / zoom) + "px Arial";
      }

      if (text.length == 2)
        ctx.fillText(
          text,
          (sedadlo[4] - 13 - poz_x) / zoom,
          (sedadlo[5] + 12 - poz_y) / zoom
        );
      if (text.length == 3)
        ctx.fillText(
          text,
          (sedadlo[4] - 22 - poz_x) / zoom,
          (sedadlo[5] + 12 - poz_y) / zoom
        );
      if (text.length == 4)
        ctx.fillText(
          text,
          (sedadlo[4] - 22 - poz_x) / zoom,
          (sedadlo[5] + 12 - poz_y) / zoom
        );
      if (text.length == 5)
        ctx.fillText(
          text,
          (sedadlo[4] - 22 - poz_x) / zoom,
          (sedadlo[5] + 12 - poz_y) / zoom
        );
    }

    //}
  } else {
    //if (animacia == false) // zakomentovane. pri velkom hladisku sa neprekreslili cisla
    //{

    if (farba != "#FFFFFF") {
      if (lokalita == "cz") ctx.fillStyle = "white";
      else ctx.fillStyle = "white";
    } else {
      if (temp) ctx.fillStyle = "red";
      else ctx.fillStyle = "black";
    }

    var text = sedadlo[1].replace(" ", "").replace(" ", "");
    var _text = sedadlo[1];
    if (_text[_text.length - 1] == " ")
      _text = _text.replace(" ", "").replace(" ", "");

    if (_text.length <= 2) {
      var size = _text.length == 1 ? font_size_1 : font_size_2;
      ctx.font = "bold " + Math.floor(size / zoom) + "px Arial";

      if (temp) {
        ctx.fillStyle = "black";
        ctx.font = " " + Math.floor(size / zoom) + "px Arial";
      }

      /*if (temp) {

                ctx.strokeStyle = "black";
                ctx.lineWidth = 1 / zoom;

                if (text.length == 2) {
                    ctx.fillText(text, (sedadlo[4] + posun_text_2_x - poz_x) / zoom, (sedadlo[5] + posun_text_2_y - poz_y) / zoom);
                    ctx.strokeText(text, (sedadlo[4] + posun_text_2_x - poz_x) / zoom, (sedadlo[5] + posun_text_2_y - poz_y) / zoom);
                }
                if (text.length == 1) {
                    ctx.fillText(text, (sedadlo[4] + posun_text_1_x - poz_x) / zoom, (sedadlo[5] + posun_text_1_y - poz_y) / zoom);
                    ctx.strokeText(text, (sedadlo[4] + posun_text_1_x - poz_x) / zoom, (sedadlo[5] + posun_text_1_y - poz_y) / zoom);
                }
            }
            else {*/
      if (text.length == 2)
        ctx.fillText(
          text,
          (sedadlo[4] + posun_text_2_x - poz_x) / zoom,
          (sedadlo[5] + posun_text_2_y - poz_y) / zoom
        );
      if (text.length == 1)
        ctx.fillText(
          text,
          (sedadlo[4] + posun_text_1_x - poz_x) / zoom,
          (sedadlo[5] + posun_text_1_y - poz_y) / zoom
        );
      /*}*/
    } else {
      if (text.length < 4) {
        if (temp == false)
          ctx.font = "bold " + Math.floor(20 / zoom) + "px Arial";
        else ctx.font = "bold " + Math.floor(20 / zoom) + "px Arial";
      } else {
        if (temp == false)
          ctx.font = "bold " + Math.floor(15 / zoom) + "px Arial";
        else ctx.font = "bold " + Math.floor(15 / zoom) + "px Arial";
      }

      if (text.length == 2)
        ctx.fillText(
          text,
          (sedadlo[4] - 13 - poz_x) / zoom,
          (sedadlo[5] + 12 - poz_y) / zoom
        );
      if (text.length == 3)
        ctx.fillText(
          text,
          (sedadlo[4] - 22 - poz_x) / zoom,
          (sedadlo[5] + 12 - poz_y) / zoom
        );
      if (text.length == 4)
        ctx.fillText(
          text,
          (sedadlo[4] - 22 - poz_x) / zoom,
          (sedadlo[5] + 12 - poz_y) / zoom
        );
      if (text.length == 5)
        ctx.fillText(
          text,
          (sedadlo[4] - 22 - poz_x) / zoom,
          (sedadlo[5] + 12 - poz_y) / zoom
        );
    }

    //}
  }

  // Ak je miesto obsadene a zaroven nie je obsadene inym pouzivatelom, zobrazime nad miesom krizik.

  /*if (zobrazKruh && (stav > 0) && temp == false) {
        var farba = kat[0];
        if (SektorPocetUvolnenych[id_sektor] == 0)
            farba = "#cccccc";

        ctx.strokeStyle = farba;
        ctx.lineWidth = 3 / zoom;
        ctx.beginPath();
        ctx.arc((sedadlo[4] - poz_x) / zoom, (sedadlo[5] - poz_y) / zoom, 25 / zoom, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
    }*/

  if (zobrazKruh == false && stav == 1 && temp == false) {
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.beginPath();
    ctx.moveTo((polygon[0] - poz_x) / zoom, (polygon[1] - poz_y) / zoom);
    ctx.lineTo((polygon[4] - poz_x) / zoom, (polygon[5] - poz_y) / zoom);
    ctx.moveTo((polygon[2] - poz_x) / zoom, (polygon[3] - poz_y) / zoom);
    ctx.lineTo((polygon[6] - poz_x) / zoom, (polygon[7] - poz_y) / zoom);
    ctx.closePath();
    ctx.stroke();
  }

  // Evidencia zvyraznenych miest
  if (ukazujem_na_toto && zvyraznene_miesta[sedadlo[0]] == null) {
    zvyraznene_miesta[sedadlo[0]] = sedadlo;
  }
}

function DrawVector(ctx, vector) {
  if (vector[0] == "rect") {
    ctx.strokeStyle = vector[6];
    ctx.fillStyle = vector[6];
    roundedRect(
      ctx,
      vector[1] * zoom + posunX * zoom,
      vector[2] * zoom + posunY * zoom,
      vector[3] * zoom,
      vector[4] * zoom,
      vector[5] * zoom,
      vector[7]
    );
  }
  if (vector[0] == "line") {
    ctx.beginPath();
    ctx.moveTo(
      vector[1] * zoom + posunX * zoom,
      vector[2] * zoom + posunY * zoom
    );
    ctx.lineTo(
      vector[3] * zoom + posunX * zoom,
      vector[4] * zoom + posunY * zoom
    );
    ctx.strokeStyle = vector[5];
    ctx.stroke();
  }
  if (vector[0] == "circle") {
    ctx.beginPath();
    ctx.arc(
      vector[1] * zoom + posunX * zoom,
      vector[2] * zoom + posunY * zoom,
      vector[3] * zoom,
      0,
      Math.PI * 2,
      true
    );

    if (vector[5] == false) {
      ctx.strokeStyle = vector[4];
      ctx.stroke();
    } else {
      ctx.fillStyle = vector[4];
      ctx.fill();
    }
  }
  if (vector[0] == "text") {
    try {
      ctx.font = Math.floor(vector[3] / zoom) + "px " + vector[2];
      ctx.fillStyle = vector[4];
      //ctx.fillText(vector[1], vector[5] * zoom - (poz_x * zoom), vector[6] * zoom - (poz_y * zoom));
      ctx.fillText(
        vector[1],
        (vector[5] - poz_x) / zoom,
        (vector[6] - poz_y) / zoom
      );
    } catch (err) {
      console.log(err.message);
    }
  }
}

function drawFont_rad(ZobrSek) {
  if (typeof r_all == "undefined") return;

  if (maSVG) return;

  //if (zobrazovatNazvy && vykreslujemNahlad == false && zoom >= 0.1) {

  var velkost = Math.floor(25 / zoom);
  var velkost2 = "" + Math.floor(25 / zoom) + "px Arial";
  var v = velkost / 2;

  ctx.font = velkost2;
  ctx.fillStyle = "black";

  for (var i in r_all) {
    if (r_all.hasOwnProperty(i)) {
      var rad = r_all[i];

      if (ZobrSek == null || ZobrSek == rad[3]) {
        if (SektorZobrazRad[rad[3]] == true) {
          ctx.fillText(
            rad[4],
            (rad[0] - poz_x) / zoom,
            (rad[1] - poz_y) / zoom
          );
        }
      }
    }
  }

  velkost2 = "" + Math.floor((25 / zoom) * 1.5) + "px Arial";
  ctx.font = velkost2;

  for (var i in sektor_pozicie) {
    if (sektor_pozicie.hasOwnProperty(i)) {
      var sektor = sektor_pozicie[i];
      if (ZobrSek == null || s_all[ZobrSek] == sektor[0]) {
        if (sektor[1] != null && sektor[2] != null) {
          ctx.fillText(
            sektor[0],
            (sektor[1] - poz_x) / zoom,
            (sektor[2] - poz_y) / zoom
          );
        }
      }
    }
  }
  //}
}

//--- Vypocita polygony pre vsetky sedadla
function GeneratePolygon() {
  for (var ik in m_all) {
    if (m_all.hasOwnProperty(ik)) {
      var sedadlo = m_all[ik];
      GetPolygon(sedadlo);
    }
  }
}

//--- Vypocita polygon pre sedadlo
function GetPolygon(sedadlo) {
  var x = sedadlo[4];
  var y = sedadlo[5];
  var rot = sedadlo[6] < 0 ? sedadlo[6] + 360 : sedadlo[6];
  rot = (rot / 180.0) * Math.PI;

  var ax = x - VS;
  var ay = y - VS;

  var bx = x + VS;
  var by = y - VS;

  var cx = x + VS;
  var cy = y + VS;

  var dx = x - VS;
  var dy = y + VS;

  Rotate(ax, ay, x, y, rot);
  ax = __x;
  ay = __y;

  Rotate(bx, by, x, y, rot);
  bx = __x;
  by = __y;

  Rotate(cx, cy, x, y, rot);
  cx = __x;
  cy = __y;

  Rotate(dx, dy, x, y, rot);
  dx = __x;
  dy = __y;

  if (sedadlo[8] == null) {
    var polygon = [ax, ay, bx, by, cx, cy, dx, dy];
    sedadlo.push(polygon);
  } else {
    sedadlo[8][0] = ax;
    sedadlo[8][1] = ay;
    sedadlo[8][2] = bx;
    sedadlo[8][3] = by;
    sedadlo[8][4] = cx;
    sedadlo[8][5] = cy;
    sedadlo[8][6] = dx;
    sedadlo[8][7] = dy;
  }
}

var minPolyg = [0, 0, 0, 0, 0, 0, 0, 0];
function GetMinPolygon(sedadlo) {
  var x = sedadlo[4];
  var y = sedadlo[5];
  var rot = sedadlo[6] < 0 ? sedadlo[6] + 360 : sedadlo[6];
  rot = (rot / 180.0) * Math.PI;
  var q = VS * 0.7;
  var ax = x - q;
  var ay = y - q;
  var bx = x + q;
  var by = y - q;
  var cx = x + q;
  var cy = y + q;
  var dx = x - q;
  var dy = y + q;

  Rotate(ax, ay, x, y, rot);
  ax = __x;
  ay = __y;
  Rotate(bx, by, x, y, rot);
  bx = __x;
  by = __y;
  Rotate(cx, cy, x, y, rot);
  cx = __x;
  cy = __y;
  Rotate(dx, dy, x, y, rot);
  dx = __x;
  dy = __y;
  minPolyg[0] = ax;
  minPolyg[1] = ay;
  minPolyg[2] = bx;
  minPolyg[3] = by;
  minPolyg[4] = cx;
  minPolyg[5] = cy;
  minPolyg[6] = dx;
  minPolyg[7] = dy;
}
function Rotate(ax, ay, sx, sy, angle) {
  var x = ax - sx;
  var y = ay - sy;
  var xx = x * Math.cos(angle) - y * Math.sin(angle);
  var yy = x * Math.sin(angle) + y * Math.cos(angle);
  __x = xx + sx;
  __y = yy + sy;
}

//-------------------

function animacia_na_sektor(id_sektor) {
  zavry_sektory();
  //document.getElementById('zoznam-volnych-miest-text').innerHTML = s_all[id_sektor] + (g_performance.ShowHiddenSeats ? " ( " + SektorPocetVolnych[id_sektor] + " )" : "") + "<i class='fa fa-chevron-down pull-right'></i>";
  //$('.zoznam-sektorov').addClass('hidden');
  ZobrazujemSektor(id_sektor, s_all[id_sektor]);

  if (maObrazok) {
    ZobrazIbaSektor(id_sektor);
    return;
  }

  var rozmer = RozmerSektorov[id_sektor];

  var zvacsenie_x = ((rozmer[2] - rozmer[0]) * 1.3) / def_roz_x;
  var zvacsenie_y = ((rozmer[3] - rozmer[1]) * 1.3) / def_roz_y;
  var zvacsenie = zvacsenie_x >= zvacsenie_y ? zvacsenie_x : zvacsenie_y;

  if (zvacsenie > zoom_zobraz_canvas) zvacsenie = zoom_zobraz_canvas * 0.95;

  var roz_platna_x = def_roz_x * zvacsenie;
  var roz_platna_y = def_roz_y * zvacsenie;

  var dif_x = roz_platna_x - (rozmer[2] - rozmer[0]) * 1.3;
  var dif_y = roz_platna_y - (rozmer[3] - rozmer[1]) * 1.3;

  animate(
    zvacsenie,
    rozmer[0] - (rozmer[2] - rozmer[0]) * 0.15 - dif_x / 2,
    rozmer[1] - (rozmer[3] - rozmer[1]) * 0.15 - dif_y / 2,
    null
  );
}

function animacia_na_100() {
  animate(max_zoom, 0, 0, null);
}

//---------------------
//----- SVG event -----
//---------------------

function svg_sektor_move(event) {
  if (!event) event = window.event;

  if (zobrazene_miesta == false) {
    var rect = Event_target(event).getBBox();

    var svgkat = document.getElementById("_svg_kategorie");
    for (var i in svgkat.childNodes) {
      if (svgkat.childNodes.hasOwnProperty(i)) {
        var elem = svgkat.childNodes[i];
        if (elem.nodeName == "path") {
          var recte = elem.getBBox();

          if (
            recte.x + 20 > rect.x &&
            recte.y + 20 > rect.y &&
            recte.x + recte.width < rect.x + rect.width + 20 &&
            recte.y + recte.height < rect.y + rect.height + 20
          ) {
            elem.setAttribute("fill-opacity", 1.0);
            elem.style.fillOpacity = "1.0";
          }
        }
      }
    }
  }
}
function svg_sektor_out(event) {
  if (!event) event = window.event;

  if (zobrazene_miesta == false) {
    var rect = Event_target(event).getBBox();

    var svgkat = document.getElementById("_svg_kategorie");
    for (var i in svgkat.childNodes) {
      if (svgkat.childNodes.hasOwnProperty(i)) {
        var elem = svgkat.childNodes[i];
        if (elem.nodeName == "path") {
          var recte = elem.getBBox();

          if (
            recte.x + 20 > rect.x &&
            recte.y + 20 > rect.y &&
            recte.x + recte.width < rect.x + rect.width + 20 &&
            recte.y + recte.height < rect.y + rect.height + 20
          ) {
            elem.setAttribute("fill-opacity", 0.7);
            elem.style.fillOpacity = "0.7";
          }
        }
      }
    }
  }
}
function svg_sektor_click(event) {
  if (!event) event = window.event;

  var rect = Event_target(event).getBBox();

  var zvacsenie_x = (rect.width * 1.3) / def_roz_x;
  var zvacsenie_y = (rect.height * 1.3) / def_roz_y;
  var zvacsenie = zvacsenie_x >= zvacsenie_y ? zvacsenie_x : zvacsenie_y;

  if (zvacsenie > zoom_zobraz_canvas) zvacsenie = zoom_zobraz_canvas * 0.95;

  var roz_platna_x = def_roz_x * zvacsenie;
  var roz_platna_y = def_roz_y * zvacsenie;

  var dif_x = roz_platna_x - rect.width * 1.3;
  var dif_y = roz_platna_y - rect.height * 1.3;

  animate(
    zvacsenie,
    rect.x - rect.width * 0.15 - dif_x / 2,
    rect.y - rect.height * 0.15 - dif_y / 2,
    null
  );
}

function svg_sektor_nahlad_move(event) {
  if (!event) event = window.event;

  //if (zobrazene_miesta == false) {
  var rect = Event_target(event).getBBox();

  var svgkat = document.getElementById("_svg_kategorie_nahlad");
  for (var i in svgkat.childNodes) {
    if (svgkat.childNodes.hasOwnProperty(i)) {
      var elem = svgkat.childNodes[i];
      if (elem.nodeName == "path") {
        var recte = elem.getBBox();

        if (
          recte.x + 20 > rect.x &&
          recte.y + 20 > rect.y &&
          recte.x + recte.width < rect.x + rect.width + 20 &&
          recte.y + recte.height < rect.y + rect.height + 20
        ) {
          elem.setAttribute("fill-opacity", 1.0);
        }
      }
    }
  }
  //}
}
function svg_sektor_nahlad_out(event) {
  if (!event) event = window.event;
  //if (zobrazene_miesta == false) {

  var rect = Event_target(event).getBBox();

  var svgkat = document.getElementById("_svg_kategorie_nahlad");
  for (var i in svgkat.childNodes) {
    if (svgkat.childNodes.hasOwnProperty(i)) {
      var elem = svgkat.childNodes[i];
      if (elem.nodeName == "path") {
        var recte = elem.getBBox();

        if (
          recte.x + 20 > rect.x &&
          recte.y + 20 > rect.y &&
          recte.x + recte.width < rect.x + rect.width + 20 &&
          recte.y + recte.height < rect.y + rect.height + 20
        ) {
          elem.setAttribute("fill-opacity", 0.7);
        }
      }
    }
  }
  //}
}
function svg_sektor_nahlad_click(event) {
  if (!event) event = window.event;
  zavry_sektory();

  // Zabezpeci, ze ked sa v nahlade klikne na nmiestny sektor tak nezoomuje ale zbrazi tabulku
  if (event.srcElement.id.substring(0, 7) == "Sektor ") {
    var sektor_nazov = event.srcElement.id.substring(7);

    if (
      typeof s_all_inverse[sektor_nazov] != "undefined" &&
      s_all_inverse[sektor_nazov] != null
    ) {
      var __id_sektor__ = s_all_inverse[sektor_nazov];
      if (
        typeof nMiestSektor[__id_sektor__] != "undefined" &&
        nMiestSektor[__id_sektor__] != null &&
        nMiestSektor[__id_sektor__] == 1
      )
        ZobrazitNMiest(__id_sektor__);
      return;
    }
  }

  var rect = Event_target(event).getBBox();

  var zvacsenie_x = (rect.width * 1.3) / def_roz_x;
  var zvacsenie_y = (rect.height * 1.3) / def_roz_y;
  var zvacsenie = zvacsenie_x >= zvacsenie_y ? zvacsenie_x : zvacsenie_y;

  if (zvacsenie > zoom_zobraz_canvas) zvacsenie = zoom_zobraz_canvas * 0.95;

  var roz_platna_x = def_roz_x * zvacsenie;
  var roz_platna_y = def_roz_y * zvacsenie;

  var dif_x = roz_platna_x - rect.width * 1.3;
  var dif_y = roz_platna_y - rect.height * 1.3;

  animate(
    zvacsenie,
    rect.x - rect.width * 0.15 - dif_x / 2,
    rect.y - rect.height * 0.15 - dif_y / 2,
    null
  );
}

function zoom_plus() {
  var new_zoom = zoom - (zoom - min_zoom) / 2;
  if (new_zoom < 1) new_zoom = min_zoom;

  //get_pozition();
  var new_poz_x = poz_x + (def_roz_x * zoom) / 2 - (def_roz_x * new_zoom) / 2;
  var new_poz_y = poz_y + (def_roz_y * zoom) / 2 - (def_roz_y * new_zoom) / 2;

  animate(new_zoom, new_poz_x, new_poz_y, 30);
}
function zoom_minus() {
  var zoom_step = max_zoom / 10;

  var new_zoom = zoom + zoom_step;
  if (new_zoom > max_zoom) new_zoom = max_zoom;

  //get_pozition();
  var new_poz_x = poz_x + (def_roz_x * zoom) / 2 - (def_roz_x * new_zoom) / 2;
  var new_poz_y = poz_y + (def_roz_y * zoom) / 2 - (def_roz_y * new_zoom) / 2;

  animate(new_zoom, new_poz_x, new_poz_y, 30);
}

function zoom_default() {
  if (maObrazok) ZobrazCeleHladisko_obrazok();
  else animate(default_zoom, default_x, default_y, 30);
}
//---------------------

//-----------------------
//----- Mouse event -----
//-----------------------

var mouse_x = 0;
var mouse_y = 0;

function GetMousePozition(event) {
  var _x = event.offsetX;
  var _y = event.offsetY;

  mouse_x = poz_x + _x * zoom;
  mouse_y = poz_y + _y * zoom;
}
function GetMousePozition_absolute(event) {
  var _x = event.offsetX;
  var _y = event.offsetY;

  mouse_x = _x;
  mouse_y = _y;
}
function GetMousePozition_notPosun(event) {
  var _x = event.offsetX;
  var _y = event.offsetY;

  mouse_x = _x * zoom;
  mouse_y = _y * zoom;
}
function GetMousePozition_notPosun_mobile(x, y) {
  var _x = x;
  var _y = y;
  mouse_x = _x * zoom;
  mouse_y = _y * zoom;
}

function mouse_is_hladisko(event) {
  var _x = event.offsetX;
  var _y = event.offsetY;

  if (_y < 0) return false;
  return true;
}

function handle(delta, x, y) {
  var new_zoom = 0;

  if (delta < 0) new_zoom = zoom * 1.5;
  else new_zoom = zoom / 1.5;

  if (new_zoom < 1) new_zoom = min_zoom;
  if (new_zoom > max_zoom) new_zoom = max_zoom;

  if (new_zoom == zoom) return;

  var new_poz_x = poz_x + x * zoom - x * new_zoom;
  var new_poz_y = poz_y + y * zoom - y * new_zoom;

  animate(new_zoom, new_poz_x, new_poz_y, 15);
}
function wheel(event) {
  if (maObrazok && zobrazIbaSektor == false) return;

  var delta = 0;
  if (!event) event = window.event;
  if (event.wheelDelta) {
    delta = event.wheelDelta / 120;
  } else if (event.detail) {
    delta = -event.detail / 3;
  }

  if (delta) GetMousePozition_absolute(event);
  handle(delta, mouse_x, mouse_y);

  if (event.preventDefault) event.preventDefault();
  event.returnValue = false;
}

var ukazujem_na_miesto = null;
var wasdrag = false;

var posuvnik = false;
var old_posuvnik_poz_x = 0;
var old_posuvnik_poz_y = 0;

var old_mouse_cord_x = 0;
var old_mouse_cord_y = 0;
var old_posun_X = 0;
var old_posun_Y = 0;
var bublina_pozastavene_zatvaranie = true;

function document_onmousemove(e) {
  if (!e) e = window.event;

  var element = e.target;
  var i = 1;
  var pohyb_bublina = false;
  while (true) {
    if (element.id == "rootPopisMiesta") {
      pohyb_bublina = true;
      break;
    }
    if (element.id == "hladisko-canvas-container") break;

    if (element.parentElement == null || i > 10) break;

    i++;
    element = element.parentElement;
  }

  if (pohyb_bublina == true) {
    if (bublinu_zatvaram == true) {
      bublinu_zatvaram = false;
      bublina_pozastavene_zatvaranie = true;
    }
  } else {
    if (bublina_pozastavene_zatvaranie == true) {
      bublina_pozastavene_zatvaranie = false;
      bublinu_zatvaram = true;
      ZavryBublinu2();
    }
  }

  if (e.target.id != "canvas" && drag == false) return;

  /*if (is_mobile) {
        if (animacia == false) {

            var obj = Event_target(event);

            if (obj.id == 'svg_nahlad_posuvnik') {
                GetMousePozition_absolute(e);

                old_mouse_cord_x = mouse_x;
                old_mouse_cord_y = mouse_y;

                var rect = obj.getBBox();
                old_posuvnik_poz_x = rect.x;
                old_posuvnik_poz_y = rect.y;

                posuvnik = true;
                drag = false;
                return;
            }

            GetMousePozition(e);

            if (typeof (event.pageY) == 'undefined')
                var event_page_y = event.clientY + document.documentElement.scrollTop;

            var event_page_y = event.pageY;

            if (get_miesto_on_x_y(mouse_x, mouse_y) == false && (event_page_y - 105) > 0) {
                drag = true;

                if (zoom > 3.0)
                    animacia = true;
                GetMousePozition_notPosun(e);
                old_mouse_cord_x = mouse_x;
                old_mouse_cord_y = mouse_y;

                old_posun_X = poz_x;
                old_posun_Y = poz_y;
                document.body.style.cursor = "move";
            }
        }
        return;
    }*/

  // Ak sa posuva hladisko
  if (drag) {
    GetMousePozition_notPosun(e);

    var mouse_dif_x = mouse_x - old_mouse_cord_x;
    var mouse_dif_y = mouse_y - old_mouse_cord_y;

    if (
      mouse_dif_x > 10 ||
      mouse_dif_y > 10 ||
      mouse_dif_x < -10 ||
      mouse_dif_y < -10
    )
      // Ak realne posuvame hladisko, nedovolime oznacovat miesta
      wasdrag = true;

    var new_poz_x = old_posun_X - mouse_dif_x;
    var new_poz_y = old_posun_Y - mouse_dif_y;

    NastavZoom(null, new_poz_x, new_poz_y);

    return;
  }

  // Zmena zoomu na posuvniku
  /*if (posuvnik) {
        GetMousePozition_absolute(e);

        var mouse_dif_y = mouse_y - old_mouse_cord_y;
        var new_poz_posuvnik_y = old_posuvnik_poz_y + mouse_dif_y;

        if (new_poz_posuvnik_y > 208) new_poz_posuvnik_y = 208;
        if (new_poz_posuvnik_y < 40) new_poz_posuvnik_y = 40;

        document.getElementById('svg_nahlad_posuvnik').setAttribute('y', new_poz_posuvnik_y);
        document.getElementById('svg_nahlad_posuvnik_text').setAttribute('y', new_poz_posuvnik_y + 11);
        document.getElementById('svg_nahlad_posuvnik_text').textContent = "" + Math.floor((max_zoom / zoom) * 100) + "%";
        NastavZoomPosuvnik(new_poz_posuvnik_y);
    }*/

  if (zobrazene_miesta == false) ZavryBublinu();

  if (
    zobrazene_miesta == true &&
    animacia == false &&
    Event_target(e).id == "canvas"
  ) {
    GetMousePozition(e);
    getGridPosition(mouse_x, mouse_y);
    for (var i in PozicieIkon) {
      if (PozicieIkon.hasOwnProperty(i)) {
        var x = Number(PozicieIkon[i][0]);
        var y = Number(PozicieIkon[i][1]);

        if (mouse_x > x && mouse_x < x + (96 / zoom) * 2 * zoom) {
          if (mouse_y > y && mouse_y < y + (96 / zoom) * 2 * zoom) {
            document.body.style.cursor = "pointer";
            return;
          }
        }
      }
    }
  }

  if (
    zobrazene_miesta == true &&
    animacia == false &&
    Event_target(e).id == "canvas"
  ) {
    GetMousePozition(e);

    var _x = e.offsetX;
    var _y = e.offsetY;

    if (get_miesto_on_x_y(mouse_x, mouse_y)) {
      var id_sektor = ukazujem_na_miesto[7];

      if (
        !(
          nMiestSektor[id_sektor] == 1 &&
          (typeof nSektorZobrazRad === "undefined" ||
            nSektorZobrazRad[id_sektor] == 0)
        )
      ) {
        ZobrazBublinu(_x, _y);
      }
    } else {
      ZavryBublinu();

      /*for (var k in zvyraznene_miesta) {
                premaz_miesto = true;
                DrawSedadlo(zvyraznene_miesta[k]);
                delete zvyraznene_miesta[k];
                premaz_miesto = false;
            }*/
    }
  }
}

function NastavZoomPosuvnik(poz_posuvnika) {
  var new_zoom =
    min_zoom + ((max_zoom - min_zoom) / (208 - 40)) * (poz_posuvnika - 40);
  var new_poz_x = poz_x + (def_roz_x * zoom) / 2 - (def_roz_x * new_zoom) / 2;
  var new_poz_y = poz_y + (def_roz_y * zoom) / 2 - (def_roz_y * new_zoom) / 2;

  NastavZoom(new_zoom, new_poz_x, new_poz_y, true);
}

function document_onmousedown(evt) {
  ZavryBublinu();

  e = evt;
  event = e;
  if (is_mobile) return;
  if (zobrazujem_galeriu != null) return;

  wasdrag = false;

  if (!e) e = window.event;

  if (animacia == false) {
    var obj = Event_target(event);

    if (obj.id == "svg_nahlad_posuvnik") {
      GetMousePozition_absolute(e);

      old_mouse_cord_x = mouse_x;
      old_mouse_cord_y = mouse_y;

      var rect = obj.getBBox();
      old_posuvnik_poz_x = rect.x;
      old_posuvnik_poz_y = rect.y;

      posuvnik = true;
      drag = false;
      return;
    }

    if (typeof event.pageY == "undefined")
      var event_page_y = event.clientY + document.documentElement.scrollTop;
    else var event_page_y = event.pageY;

    GetMousePozition(e);
    if (
      /*get_miesto_on_x_y(mouse_x, mouse_y) == false &&*/ event_page_y - 105 >
      0
    ) {
      drag = true;

      if (zoom > 3.0) animacia = true;
      GetMousePozition_notPosun(e);
      old_mouse_cord_x = mouse_x;
      old_mouse_cord_y = mouse_y;

      old_posun_X = poz_x;
      old_posun_Y = poz_y;
      document.body.style.cursor = "move";
    }
  }
}

function document_onmouseup(evt) {
  e = evt;
  event = e;
  if (is_mobile) return;
  if (zobrazujem_galeriu != null) return;

  if (!e) e = window.event;

  drag = false;
  posuvnik = false;
  animacia = false;
  GetMousePozition(e);

  if (get_miesto_on_x_y(mouse_x, mouse_y))
    document.body.style.cursor = "pointer";
  else document.body.style.cursor = "default";

  PrekresliCanvas();
}

function document_onclick(evt) {
  if (wasdrag) {
    wasdrag = false;
    return;
  }

  e = evt;
  event = e;

  if (zobrazujem_galeriu != null) return;

  if (!e) e = window.event;

  GetMousePozition(e); // Zistime poziciu mysy

  getGridPosition(mouse_x, mouse_y);

  if (zobrazujem_foto == true && zobrazene_miesta) {
    for (var i in PozicieIkon) {
      if (PozicieIkon.hasOwnProperty(i)) {
        var x = Number(PozicieIkon[i][0]);
        var y = Number(PozicieIkon[i][1]);

        if (mouse_x > x && mouse_x < x + (96 / zoom) * 2 * zoom) {
          if (mouse_y > y && mouse_y < y + (96 / zoom) * 2 * zoom) {
            Zobraz_galeriu(i.substring(1));
            return;
          }
        }
      }
    }
  }
  //if (Event_target(e).id == 'canvas') {                           // Klikat na miesta sa da len klikanim na canvas
  if (zobrazene_miesta == true && animacia == false) {
    // Klikat na miesta sa da len ked su miesta zobrazene a zaroven neprebieha animacia
    if (get_miesto_on_x_y(mouse_x, mouse_y)) {
      // Zistime miesto na ktore sa kliklo
      if (
        m[ukazujem_na_miesto[0]][1] != 2 ||
        g_performance.Resale.Seats[ukazujem_na_miesto[0]] != null
      ) {
        var id_sektor = ukazujem_na_miesto[7];

        if (maSVG == true || maObrazok == true) {
          if (
            nMiestSektor[id_sektor] == 1 &&
            (typeof nSektorZobrazRad === "undefined" ||
              nSektorZobrazRad[id_sektor] == 0)
          ) {
            ZobrazitNMiest(id_sektor);
            return;
          }
        }

        if (
          zobrazIbaSektor == false ||
          (zobrazIbaSektor == true &&
            ukazujem_na_miesto[7] == __zobrazenySektor)
        )
          OnSeat_click(ukazujem_na_miesto);
      }
    } else {
      /*var elem_svg_target = null;
                var svg_kat = document.getElementById('_svg_kategorie');
                for (var i in svg_kat.childNodes) {
                    var elem = svg_kat.childNodes[i];
                    if (elem.nodeName == 'path') {
                        var r = elem.getBBox();
                        if (r.x < mouse_x && (r.x + r.width) > mouse_x && r.y < mouse_y && (r.y + r.height) > mouse_y)
                            elem_svg_target = elem;
                    }
                }*/

      var elem_svg_target = document
        .elementsFromPoint(evt.clientX, evt.clientY)
        .find((e) => e.parentNode.id === "_svg_kategorie");

      if (elem_svg_target != null /*evt.target.nodeName == "path"*/) {
        //var rect = Event_target(evt).getBBox();
        var rect = elem_svg_target.getBBox();

        var svgsek = document.getElementById("_svg_sektory");
        for (var i in svgsek.childNodes) {
          var elem = svgsek.childNodes[i];

          if (elem.nodeName == "path") {
            var recte = elem.getBBox();
            if (
              recte.x + 100 > rect.x &&
              recte.y + 100 > rect.y &&
              recte.x + recte.width < rect.x + rect.width + 100 &&
              recte.y + recte.height < rect.y + rect.height + 100
            ) {
              var id_sektor = Number(
                s_all_inverse[elem.id.replace("Sektor ", "")]
              );
              if (nMiestSektor[id_sektor] == 1) ZobrazitNMiest(id_sektor);
            }
          }
        }
      }
    }
  }
  //}

  /*
    
    if (!event)
        event = window.event;

    if (zobrazene_miesta == false) {
        var rect = Event_target(event).getBBox();

        var svgkat = document.getElementById('_svg_kategorie');
        for (var i in svgkat.childNodes) {
            if (svgkat.childNodes.hasOwnProperty(i)) {
                var elem = svgkat.childNodes[i];
                if (elem.nodeName == 'path') {
                    var recte = elem.getBBox();

                    if (recte.x + 20 > rect.x && recte.y + 20 > rect.y && (recte.x + recte.width) < (rect.x + rect.width + 20) && (recte.y + recte.height) < (rect.y + rect.height + 20)) {
                        elem.setAttribute('fill-opacity', 1.0);
                        elem.style.fillOpacity = '1.0';
                    }
                }
            }
        }
    }

    */

  return true;
}

function document_keypressed(evt) {}

function document_keydown(evt) {
  e = evt;
  if (is_mobile) return;
  if (zobrazujem_galeriu != null) return;

  if (e.keyCode == 38) {
    if (animacia_posuvania == false) {
      animacia_posuvania = true;
      animate_posun();
    }
    animH = true;
  }

  if (e.keyCode == 40) {
    //dole
    if (animacia_posuvania == false) {
      animacia_posuvania = true;
      animate_posun();
    }
    animD = true;
  }

  if (e.keyCode == 37) {
    //v lavo
    if (animacia_posuvania == false) {
      animacia_posuvania = true;
      animate_posun();
    }
    animV = true;
  }
  if (e.keyCode == 39) {
    //v prav
    if (animacia_posuvania == false) {
      animacia_posuvania = true;
      animate_posun();
    }
    animP = true;
  }
}

function document_keyup(evt) {
  e = evt;
  if (is_mobile) return;
  if (zobrazujem_galeriu != null) return;

  if (e.keyCode == 38) animH = false;

  if (e.keyCode == 40) animD = false;

  if (e.keyCode == 37) animV = false;

  if (e.keyCode == 39) animP = false;

  if (e.keyCode >= 37 && e.keyCode <= 40)
    if (animH == false && animD == false && animV == false && animP == false)
      animacia_posuvania = false;
}

function mobile_touch(x, y) {
  if (drag) {
    GetMousePozition_notPosun_mobile(x, y);

    var mouse_dif_x = mouse_x - old_mouse_cord_x;
    var mouse_dif_y = mouse_y - old_mouse_cord_y;

    if (mouse_dif_x > 250 || mouse_dif_y > 250) {
      mouse_dif_x = 0;
      mouse_dif_y = 0;
      old_mouse_cord_x = mouse_x;
      old_mouse_cord_y = mouse_y;
      old_posun_X = poz_x;
      old_posun_y = poz_y;
      return;
    }

    var new_poz_x = old_posun_X - mouse_dif_x;
    var new_poz_y = old_posun_Y - mouse_dif_y;

    NastavZoom(null, new_poz_x, new_poz_y);

    return;
  }
}

function get_miesto_on_x_y(x, y) {
  ukazujem_na_miesto = null;
  getGridPosition(mouse_x, mouse_y);
  var x1 = grid_x;
  var y1 = grid_y;

  var u = false;
  d = false;
  r = false;
  l = false;
  var xu = 0;
  yu = 0;
  xd = 0;
  yd = 0;
  xr = 0;
  yr = 0;
  xl = 0;
  yl = 0;

  getGridPosition(mouse_x + VS, mouse_y);
  if (x1 != grid_x || y1 != grid_y) {
    xr = grid_x;
    yr = grid_y;
    r = true;
  }
  getGridPosition(mouse_x - VS, mouse_y);
  if (x1 != grid_x || y1 != grid_y) {
    xl = grid_x;
    yl = grid_y;
    l = true;
  }
  getGridPosition(mouse_x, mouse_y + VS);
  if (x1 != grid_x || y1 != grid_y) {
    xu = grid_x;
    yu = grid_y;
    u = true;
  }
  getGridPosition(mouse_x, mouse_y - VS);
  if (x1 != grid_x || y1 != grid_y) {
    xd = grid_x;
    yd = grid_y;
    d = true;
  }

  if (get_miesto_grid(x1, y1, x, y) == true) {
    return true;
  } else {
    if (r == true && get_miesto_grid(xr, yr, x, y)) return true;
    if (l == true && get_miesto_grid(xl, yl, x, y)) return true;
    if (u == true && get_miesto_grid(xu, yu, x, y)) return true;
    if (d == true && get_miesto_grid(xd, yd, x, y)) return true;
    return false;
  }
}

var povolena_odchylka = 1.0;

function get_miesto_grid(grid_x, grid_y, x, y) {
  if (
    typeof Grid[grid_x] != "undefined" &&
    Grid[grid_x] != null &&
    typeof Grid[grid_x][grid_y] != "undefined" &&
    Grid[grid_x][grid_y] != null
  ) {
    // TODO urobit grid tak aby mal vsetky polozky, bez nutnosti kontroly
    var pole = Grid[grid_x][grid_y];
    ukazujem_na_miesto = null;
    for (var i in pole) {
      if (pole.hasOwnProperty(i)) {
        miesto = m_all[pole[i]];

        var vzdialenost = Math.sqrt(
          (miesto[4] - x) * (miesto[4] - x) + (miesto[5] - y) * (miesto[5] - y)
        );

        if (vzdialenost < povolena_odchylka * VS2) {
          ukazujem_na_miesto = miesto;
          return true;
        }
      }
    }

    return false;
  }
}

//-------------------
//----- Galeria -----
//-------------------

function Zobraz_galeriu(nazov) {
  document.getElementById("gallery").style.display = "";
  document.getElementById("gallery").style.top = $(window).scrollTop() + "px";
  document.getElementById("gallery_nazov").innerHTML =
    lang["GaleriaSektora"] + ":" + nazov.split("_")[0];
  zobrazujem_galeriu = nazov;
  cislo_fotografie = 0;

  zobraz_sipky();

  var canvas_foto = document.getElementById("canvas_gallery");
  canvas_foto.width = canvas_foto.clientWidth;
  canvas_foto.height = canvas_foto.clientHeight;
  ctx_foto = canvas_foto.getContext("2d");
  ctx_foto.clearRect(0, 0, canvas_foto.clientWidth, canvas_foto.clientHeight);

  if (svg_img[nazov][0][1] == null) {
    var image = new Image();
    image.src = svg_images + nazov + "/" + svg_img[nazov][0][0];
    image.onload = nacitaj_dalsiu;
    svg_img[nazov][0][1] = image;
  }

  cakaj_zobraz_obrazok();
}

function nacitaj_dalsiu() {
  for (var i in svg_img[zobrazujem_galeriu]) {
    if (svg_img[zobrazujem_galeriu].hasOwnProperty(i)) {
      if (svg_img[zobrazujem_galeriu][i][1] == null) {
        var image = new Image();
        image.src =
          svg_images +
          zobrazujem_galeriu +
          "/" +
          svg_img[zobrazujem_galeriu][i][0];
        image.onload = nacitaj_dalsiu;
        svg_img[zobrazujem_galeriu][i][1] = image;
        return;
      }
    }
  }
}

function cakaj_zobraz_obrazok() {
  if (svg_img[zobrazujem_galeriu][cislo_fotografie][1] != null) {
    if (
      svg_img[zobrazujem_galeriu][cislo_fotografie][1].width != 0 &&
      svg_img[zobrazujem_galeriu][cislo_fotografie][1].complete == true
    ) {
      var img = svg_img[zobrazujem_galeriu][cislo_fotografie][1];

      var img_width = img.width;
      var img_height = img.height;

      var canvas_width = document.getElementById("canvas_gallery").clientWidth;
      var canvas_height =
        document.getElementById("canvas_gallery").clientHeight;

      var px = canvas_width / img_width;
      var py = canvas_height / img_height;

      var p = px < py ? px : py;

      var vykreslim_x = img_width * p;
      var vykreslim_y = img_height * p;

      var canvas_foto = document.getElementById("canvas_gallery");
      canvas_foto.width = canvas_foto.clientWidth;
      canvas_foto.height = canvas_foto.clientHeight;

      ctx_foto = canvas_foto.getContext("2d");
      ctx_foto.drawImage(
        img,
        0,
        0,
        img_width,
        img_height,
        (canvas_width - vykreslim_x) / 2,
        (canvas_height - vykreslim_y) / 2,
        vykreslim_x,
        vykreslim_y
      );
    } else {
      setTimeout("cakaj_zobraz_obrazok();", 100);
    }
  } else {
    setTimeout("cakaj_zobraz_obrazok();", 100);
  }
}

function chod_na_dalsi() {
  if (svg_img[zobrazujem_galeriu].length > cislo_fotografie + 1) {
    cislo_fotografie++;
    cakaj_zobraz_obrazok();

    zobraz_sipky();
  }
}

function chod_na_predcadzajuci() {
  if (cislo_fotografie != 0) {
    cislo_fotografie--;
    cakaj_zobraz_obrazok();

    zobraz_sipky();
  }
}

function zobraz_sipky() {
  if (cislo_fotografie == svg_img[zobrazujem_galeriu].length - 1)
    document.getElementById("sipka_vpravo").style.display = "none";
  else document.getElementById("sipka_vpravo").style.display = "";

  if (cislo_fotografie == 0)
    document.getElementById("sipka_vlavo").style.display = "none";
  else document.getElementById("sipka_vlavo").style.display = "";
}

function Zavry_galeriu() {
  zobrazujem_galeriu = null;
  cislo_fotografie = 0;
  document.getElementById("gallery").style.display = "none";
}

//--------------------
//----- Animacia -----
//--------------------

var animate_zoom_step = 0;
var animate_position_x_step = 0;
var animate_position_y_step = 0;
var animate_count = 0;
var animate_c = 0;

function animate(new_zoom, new_poz_x, new_poz_y, pocet_krokov) {
  animacia = true;
  animate_count = 50;
  //get_pozition();

  var dif_poz = Math.max(
    Math.abs(poz_x - new_poz_x),
    Math.abs(poz_y - new_poz_y)
  );
  if (
    pocet_krokov == null //animate_count = Math.floor((dif_poz / Math.max(H_max_x, H_max_y)) * animate_count) + 2;
  );
  else animate_count = pocet_krokov;

  animate_position_x_step = (new_poz_x - poz_x) / animate_count;
  animate_position_y_step = (new_poz_y - poz_y) / animate_count;
  animate_zoom_step = (new_zoom - zoom) / animate_count;
  animate_c = 0;

  animate_step();
}

function animate_step() {
  animate_c++;
  var new_zoom = zoom + animate_zoom_step;
  var new_poz_x = poz_x + animate_position_x_step;
  var new_poz_y = poz_y + animate_position_y_step;

  NastavZoom(new_zoom, new_poz_x, new_poz_y);

  if (animate_c < animate_count) setTimeout("animate_step()", 1);
  else {
    PrekresliCanvas();
    animacia = false;
    PrekresliCanvas();
  }
}

//--------------------

//--------------------------------------
//------ Animacie vyvolane klavesov ----
//--------------------------------------

var animacia_posuvania = false;
var animH = false;
var animD = false;
var animP = false;
var animV = false;

function animate_posun() {
  if (animacia_posuvania) {
    var animate_step = 10 * zoom;

    if (animH) {
      var new_poz_x = poz_x;
      var new_poz_y = poz_y - animate_step;
    }
    if (animP) {
      var new_poz_x = poz_x + animate_step;
      var new_poz_y = poz_y;
    }
    if (animD) {
      var new_poz_x = poz_x;
      var new_poz_y = poz_y + animate_step;
    }
    if (animV) {
      var new_poz_x = poz_x - animate_step;
      var new_poz_y = poz_y;
    }

    NastavZoom(null, new_poz_x, new_poz_y);
    setTimeout("animate_posun();", 5);
  }
}

//------ TOOLS -------
function Event_target(event) {
  if (typeof event.target != "undefined") return event.target;

  return event.srcElement;
}

var refresh_velkost_okna = false; // Ak sa nastavy na true, nastane prepocet velkosti okna, t.j. zmena velkosti canvasu

function body_resize() {
  if (zobrazujem_galeriu != null) cakaj_zobraz_obrazok();

  refresh_velkost_okna = true;
}

function check_zmena_velkosti_okna() {
  if (refresh_velkost_okna == true) {
    refresh_velkost_okna = false;
    event_zmena_velkosti_okna();
  }
  setTimeout("check_zmena_velkosti_okna();", 500);
}
check_zmena_velkosti_okna();

function event_zmena_velkosti_okna() {
  if (canceled) return;

  if (maObrazok) ZobrazCeleHladisko_obrazok();

  NastavDefaultZoom();
}

function SpracujRychlyNakup(data) {
  var HTML = new Array();
  QuickPurcharseHladiskoPrice = 0;
  var pocet = 0;

  HTML.push('<table class="table table-hover table-bordered1 table-miesta">');

  HTML.push("<thead>");
  HTML.push("    <tr>");
  HTML.push("        <th>" + lang["lbSektor"] + "</th>");
  HTML.push("		   <th>" + lang["lbRad"] + "</th>");
  HTML.push("        <th>" + lang["lbSedadlo"] + "</th>");
  HTML.push("        <th>" + lang["Cena"] + "</th>");
  HTML.push("        <th></th>");
  HTML.push("    </tr>");
  HTML.push("</thead>");

  HTML.push("<tbody>");

  if (data != null) {
    for (var i in data.Performance_count[g_performance.ID]) {
      if (data.Performance_count[g_performance.ID].hasOwnProperty(i)) {
        pocet++;
        var miesto = data.Performance_count[g_performance.ID][i];
        var ID_Miesto_javisko = miesto.ID_Miesto_Javisko;

        var sedadlo = m_all[ID_Miesto_javisko][1];
        var rad = m_all[ID_Miesto_javisko][2];
        var sektor = s_all[m_all[ID_Miesto_javisko][7]];
        var cena = miesto.Cena;
        var format_cena = Format_mena(cena);
        QuickPurcharseHladiskoPrice += cena;

        HTML.push("    <tr>");
        HTML.push('        <td align="left">');
        HTML.push('             <table class="sektor">');
        HTML.push('				    <tr class="f1lex-c">');
        HTML.push(
          '					    <td class="f1lex-c"><span class="sektor-color" style="background-color:' +
            k_all[m_all[ID_Miesto_javisko][3]][0] +
            '"></td>'
        );
        HTML.push('						<td class="sektor-name">' + sektor + "</td>");
        HTML.push("					</tr>");
        HTML.push("				</table>");
        HTML.push("			</td>");
        HTML.push("			<td>" + rad + "</td>");
        HTML.push("			<td>" + sedadlo + "</td>");
        HTML.push('			<td class="text-nowrap">' + format_cena + "</td>");
        HTML.push('			<th scope="row" class="text-center">');
        HTML.push(
          '			    <a href="javascript:OdznacMiesto(' +
            ID_Miesto_javisko +
            ')"><i class="fa fa-close"></i></a>'
        );
        HTML.push("			</th>");
        HTML.push("		</tr>");
      }
    }
  }

  if (typeof qp_bascent_count != "undefined") qp_bascent_count = pocet;

  if (pocet == 0) {
    HTML = new Array();
    HTML.push('<div class="msgs text-center">');
    HTML.push('    <div class="vybrat-miesta-msg">');
    HTML.push("        <p>" + lang["RychlyNakup_NevybMiesta"] + "</p>");
    HTML.push('        <p class="pridaj-miesto text-center">');
    HTML.push(
      '            <button onclick="quickpurchase_redirect_event_performaance();" class="btn btn-default" type="button"><i class="fa fa-plus"></i> ' +
        lang["RychlyNakup_Pridaj"] +
        "</button>"
    );
    HTML.push("        </p>");
    HTML.push("    </div>");
    HTML.push("</div>");
    $("#vyber-sedenia-hladisko").html(HTML.join(""));
    quickpurchase_fill_price();
    return;
  }

  HTML.push("    <tr>");
  HTML.push('        <td colspan="1" class="pridaj-miesto">');
  HTML.push(
    '            <button onclick="quickpurchase_redirect_event_performaance();" class="btn btn-default" type="button"><i class="fa fa-plus"></i> ' +
      lang["RychlyNakup_Pridaj"] +
      "</button>"
  );
  HTML.push("        </td>");
  HTML.push(
    '        <td colspan="3" class="sum-text text-right"><span>Spolu</span> ' +
      Format_mena(QuickPurcharseHladiskoPrice) +
      "</td>"
  );
  HTML.push('        <th scope="row" class="text-center">&nbsp;</th>');
  HTML.push("    </tr>");

  HTML.push("</tbody>");
  HTML.push("</table>");

  $("#vyber-sedenia-hladisko").html(HTML.join(""));

  quickpurchase_fill_price();
}

function OpravOznacene() {}

var animationNameKosik = "bounceInUp";
var animationNamePocetVst = "fadeIn";
var animationEnd =
  "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";
var id_sektor_nmiest = 0;

var pocet_rez_nmiest = 0; // Sem sa vrati, kolko miest moze pouzivatel oznacit v n-miestnom sektore
var aktivne_teraz = null; // Jquery objekt pre tlacitko s poctom miest v n-miestnom sektore, ktory je prave oznaceny

//----------------------------------
//------ GENEROVAVANIE VYZORU ------
//----------------------------------
function GenerujVyzor_preinit() {
  window["c"] = 0;
  for (var i in m) {
    if (m.hasOwnProperty(i)) {
      var item = m[i];
      item[0] = item[0] + c;
      c = item[0];
    }
  }

  window["m_all"] = new Array();
  window["s_all"] = new Array();
  window["bloky"] = new Array();
  window["rozmery_sektorov"] = new Array();
  window["rady_sort"] = new Array();
  window["v_all"] = new Array();
  window["pocet"] = 0;
}

function GenerujVyzor() {
  var id_blok_old = tSektory[0][2]; // Pre detekciu ci sa nezmenil blok

  var rozmer_stvorca = 60;

  for (var i = 0; i < tSektory.length; i++) {
    SektorPoradie[tSektory[i][0]] = i;
  }

  var buff = tSektory;
  tSektory = new Array();
  for (var i in buff) {
    if (buff.hasOwnProperty(i)) {
      tSektory[buff[i][0]] = buff[i];
      tSektory[buff[i][0]].push([]);
    }
  }

  var SektorySort = new Array();
  for (var i in tSektory) {
    if (tSektory.hasOwnProperty(i)) {
      var sektor = tSektory[i];
      SektorySort.push(sektor);
    }
  }
  SektorySort.sort(zoradSektoryPodlaBloku);

  var buffRady = new Array();

  for (var i in tRady) {
    if (tRady.hasOwnProperty(i)) {
      var id_sektor = tRady[i][1];
      if (rady_sort[id_sektor] == null) {
        rady_sort[id_sektor] = new Array();
      }
      rady_sort[id_sektor].push(tRady[i][0]);
    }
  }

  for (var i in tRady) {
    if (tRady.hasOwnProperty(i)) {
      var id_sektor = tRady[i][1];
      tSektory[id_sektor][5][tRady[i][0]] = tRady[i];
      tRady[i].push([]);
      buffRady[tRady[i][0]] = tRady[i];
    }
  }

  for (var i in tMiesta) {
    if (tMiesta.hasOwnProperty(i)) {
      miesto = tMiesta[i];
      id_miesto = miesto[0];
      id_rad = miesto[1];

      if (lokalita == "sk") buffRady[id_rad][5].push(tMiesta[i]);
      else buffRady[id_rad][5][id_miesto] = tMiesta[i];
    }
  }

  //-------- ZISTIME ROZMERY BLOKOV ----

  var roz_blok_x = new Array(); // rozmery blokov pre sektory
  var roz_blok_y = new Array();

  roz_blok_x[1] = 0;
  roz_blok_y[1] = 0;

  for (var i in tSektory) {
    if (tSektory.hasOwnProperty(i)) {
      var sektor = tSektory[i];

      var id_blok = sektor[2]; // Zistime blok v ktorom sa nachadza sektor
      var blok_x = sektor[3]; // Zistime kde v bloku sa nachadza sektor
      var blok_y = sektor[4];

      if (roz_blok_x[id_blok] == null) roz_blok_x[id_blok] = new Array();
      if (roz_blok_y[id_blok] == null) roz_blok_y[id_blok] = new Array();
      if (roz_blok_x[id_blok][blok_x] == null) roz_blok_x[id_blok][blok_x] = 0;
      if (roz_blok_y[id_blok][blok_y] == null) roz_blok_y[id_blok][blok_y] = 0;

      var x = 0;
      var y = 0;
      var x_max = 0;

      for (var j in sektor[5]) {
        // Prechadzame rady
        if (sektor[5].hasOwnProperty(j)) {
          var rad = sektor[5][j];
          y += rozmer_stvorca;
          x = 0;

          for (var k in rad[5]) {
            // prechadzame miesta
            if (rad[5].hasOwnProperty(k)) {
              var miesto = rad[5][k];

              x += rozmer_stvorca;
              if (x > x_max) x_max = x;
            }
          }
        }
      }
      // V y a x_max mamme velkost bloku
      if (roz_blok_x[id_blok][blok_x] < x_max + rozmer_stvorca)
        roz_blok_x[id_blok][blok_x] = x_max + rozmer_stvorca;
      if (roz_blok_y[id_blok][blok_y] < y + rozmer_stvorca)
        roz_blok_y[id_blok][blok_y] = y + rozmer_stvorca;
      rozmery_sektorov[sektor[0]] = [x_max, y];
    }
  }

  var x = 0; // suradnice na ktorych vykreslujeme
  var y = 0;
  var max_y = 0;
  var posun_y = 0;

  var pocet_v_sektore = 0;

  for (var i in SektorySort) {
    if (SektorySort.hasOwnProperty(i)) {
      var sektor = SektorySort[i];
      pocet_v_sektore = 0;

      var id_blok = sektor[2];
      var blok_x = sektor[3]; // Zistime kde v bloku sa nachadza sektor
      var blok_y = sektor[4];

      s_all.push([sektor[0], sektor[1]]);

      if (id_blok != id_blok_old) {
        // Zmenil sa blok
        id_blok_old = id_blok;
        posun_y += max_y;
        posun_y += 100;
        max_y = 0;
      }

      var _y = 0;
      for (var i = 1; i < blok_y; i++)
        _y +=
          (isnull(roz_blok_y[id_blok][i]) ? 0 : roz_blok_y[id_blok][i]) +
          rozmer_stvorca;

      var _x = 0;
      for (var i = 1; i < blok_x; i++)
        _x +=
          (isnull(roz_blok_x[id_blok][i]) ? 0 : roz_blok_x[id_blok][i]) +
          rozmer_stvorca;

      y = _y;

      if (y > 0 == false && y < 1000000 == false) y = 100;

      if (y > max_y) max_y = y;

      var x1 = _x;

      var rozm_sektora_x = rozmery_sektorov[sektor[0]][0];
      var idckaradov = rady_sort[sektor[0]];

      for (var jj in idckaradov) {
        // Prechadzame rady
        if (idckaradov.hasOwnProperty(jj)) {
          var j = idckaradov[jj];
          //for(var j in sektor[5]) {

          var rad = sektor[5][j];
          y += rozmer_stvorca;
          if (y > max_y) max_y = y;

          var _buf_ = new Array();
          var pocet_miest_v_rade = 0;
          for (var k in rad[5]) {
            if (rad[5].hasOwnProperty(k)) {
              _buf_.push(Number(k));
              pocet_miest_v_rade++;
            }
          }
          _buf_.sort(sortnumber);

          if (radenie[rad[0]] == "DESC") {
            _buf_.reverse();
          }

          var x2 = x1 + rozm_sektora_x;
          x = x1 + (rozm_sektora_x - pocet_miest_v_rade * rozmer_stvorca) / 2;

          //for(var k in rad[5]) {            // prechadzame miesta
          for (var kk in _buf_) {
            if (_buf_.hasOwnProperty(kk)) {
              var k = _buf_[kk];
              var miesto = rad[5][k];
              x += rozmer_stvorca;

              var id_miesto_javisko = miesto[0];
              var info_miesto = miesto[2] + miesto[3];
              var info_rad = rad[2];
              var id_sedadlo_kat = miesto[4];
              var id_sektor = sektor[0];

              if (pocet_v_sektore == 0) {
                var velkost_textu = sektor[1].length * 20;

                var posuvat =
                  typeof roz_blok_x[id_blok][blok_x + 1] == "undefined"
                    ? false
                    : true;

                if (rozmery_sektorov[sektor[0]][0] < velkost_textu && posuvat) {
                  var p = velkost_textu - rozmery_sektorov[sektor[0]][0];
                  v_all.push([
                    "text",
                    sektor[1],
                    "Arial",
                    35,
                    "black",
                    x - p,
                    y + posun_y,
                    id_sektor,
                  ]);
                } else
                  v_all.push([
                    "text",
                    sektor[1],
                    "Arial",
                    35,
                    "black",
                    x,
                    y + posun_y,
                    id_sektor,
                  ]);
              }

              m_all.push([
                id_miesto_javisko,
                info_miesto,
                info_rad,
                id_sedadlo_kat,
                x,
                y + posun_y + 35,
                0,
                id_sektor,
              ]);
              pocet++;
              pocet_v_sektore++;
            }
          }
          v_all.push([
            "text",
            rad[2],
            "Arial",
            25,
            "black",
            x2 + 50,
            y + posun_y + 45,
            id_sektor,
          ]);
        }
      }
    }
  }
}

function sortnumber(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function zoradSektoryPodlaBloku(sektor1, sektor2) {
  if (sektor1[2] < sektor2[2]) return -1;
  if (sektor1[2] > sektor2[2]) return 1;
  return 0;
}

function NacitajIframe(url) {
  var div = document.getElementById("div-iframe");
  var width = window.innerWidth > 1400 ? 1200 : window.innerWidth * 0.8;
  var height = window.innerHeight * 0.9;

  div.style.left = (window.innerWidth - width) / 2 + "px";
  div.style.top = (window.innerHeight - height) / 2 + "px";
  div.style.width = width + "px";
  div.style.height = height + "px";
  div.style.display = "";
  $(div).html(
    '<a onclick=\'document.getElementById("div-iframe").style.display="none";\' style=\'position:absolute;top:-15px;left:' +
      (width - 15) +
      "px;width:30px;height:30px;background-image:url(../images/lightbox/fancybox.png);background-position:-40px 0px;cursor:pointer;z-index:1000001;'></a><iframe src='" +
      url +
      "' height='" +
      height +
      "' width='" +
      width +
      "' scrolling='auto'></iframe>"
  );
}

var Sektory = new Array();
var seatBAN = true;
var ok_medzery = "";

function ZistiPoradieMiestVHladisku() {
  Sektory = new Array();
  for (var i in s_all) {
    Sektory[i] = new Array();
  }

  if (typeof r_all == "undefined" || r_all.length == 0) {
    for (var i in m_all) {
      var seat = m_all[i];
      var nazov_radu = seat[2];
      var id_sektor = seat[7];

      if (Sektory[id_sektor][nazov_radu] == null)
        Sektory[id_sektor][nazov_radu] = new Array();
    }
  } else {
    for (var i in r_all) {
      var rad = r_all[i];
      var id_Sektor = rad[3];
      var nazov_radu = rad[4];
      Sektory[id_Sektor][nazov_radu] = new Array();
    }
  }

  for (var i in m_all) {
    var seat = m_all[i];
    var nazov_radu = seat[2];
    var id_sektor = seat[7];
    if (isnull(Sektory[id_sektor][nazov_radu]) == false)
      Sektory[id_sektor][nazov_radu].push(seat);
  }

  for (var i in Sektory) {
    for (var ii in Sektory[i]) {
      var rad = Sektory[i][ii];
      rad.sort(seat_sort_id);
    }
  }

  var skupina = 0;
  for (var id_sektor in Sektory) {
    skupina++;
    for (nazov_radu in Sektory[id_sektor]) {
      var rad = Sektory[id_sektor][nazov_radu];
      var predchadzajuce = null;
      for (var poradie_miesta in rad) {
        if (rad[poradie_miesta][1] == "|N|") continue;

        if (predchadzajuce == null) {
          rad[poradie_miesta].push(skupina);
        } else {
          vzdialenost = distance_seat(predchadzajuce, rad[poradie_miesta]);

          if (vzdialenost > 100) skupina++;

          rad[poradie_miesta].push(skupina);
        }
        predchadzajuce = rad[poradie_miesta];
      }
      skupina++;
    }
  }
}

function seat_sort_id(s1, s2) {
  return s1[0] - s2[0];
}

function distance_seat(A, B) {
  var x1 = A[4];
  var y1 = A[5];
  var x2 = B[4];
  var y2 = B[5];

  return Math.sqrt(
    Math.pow(Math.abs(x2 - x1), 2) + Math.pow(Math.abs(y2 - y1), 2)
  );
}

function zistisusedov(idmj) {
  return;

  var rad = m_all[idmj][2];
  var id_sektor = m_ll[idmj][7];
  var id_skupina = m_all[idmj][9];

  var Sektor = Sektory[id_sektor];
  var Rad = Sektor[rad];

  var index_miesto = 0;
  for (var i = 0; i < Rad.length; i++) {
    if (Rad[i][0] == idmj) {
      index_miesto = i;
      break;
    }
  }

  var okolie = new Array();

  for (var i = -2; i <= 2; i++)
    okolie.push(Sektor_rad_get_stav(Rad, index_miesto + i));

  return okolie;
}

function Sektor_rad_get_stav(rad, index) {
  if (index < 0) return null;

  if (index > rad.length) return null;

  if (Rad[index - 2][1] == "|N|") return null;

  var miesto = rad[index];
  var idmj = miesto[0];

  if (m[idmj] == 1 || m[idmj] == 2) {
    if (isnull(oznacene[idmj]) == true) return 1;
    else return 2;
  }
  if (isnull(oznacene[idmj]) == false) return 2;

  if (m[idmj] == 3) return null;

  return miesto;
}

function Sektor_get_groups(id_sektor) {
  var skupina = null;
  var skupiny = new Array();
  var stav_old = -1;

  for (var poradie_radu in Sektory[id_sektor]) {
    var rad = Sektory[id_sektor][poradie_radu];

    for (var poradie_miesta in rad) {
      var miesto = rad[poradie_miesta];
      var idmj = miesto[0];

      var stav = 0;
      if (m[idmj][1] == 1 || m[idmj][1] == 2) {
        if (isnull(oznacene[idmj]) == true) stav = 2;
        else stav = 1;
      }

      if (
        skupina != null &&
        skupina.length != 0 &&
        skupina[0][9] != miesto[9]
      ) {
        skupiny.push(skupina);
        skupina = new Array();
        stav_old = -1;
      }

      if ((stav == 0 || stav == 1) && stav != stav_old) {
        skupina = new Array();
      }
      if (stav == 0 || stav == 1) skupina.push(miesto);

      if (stav != 0 && stav != 1 && (stav_old == 0 || stav_old == 1)) {
        skupiny.push(skupina);
        skupina = null;
      }

      stav_old = stav;
    }
    stav_old = -1;
  }

  return skupiny;
}

function OverMedzery(msg) {
  ok_medzery = OverMedzery2();

  OverMedzeryMsg(msg);

  if (ok_medzery == "") return true;
  else return false;
}

function OverMedzery2() {
  var skupiny = new Array();
  for (var i in oznacene) {
    if (oznacene[i] == 1) {
      var id_mj = i;
      var miesto = m_all[id_mj];
      var cislo_skupiny = miesto[9];

      var overSektor = true;
      if (
        typeof g_performance.SectorsSettings != "undefined" &&
        g_performance.SectorsSettings != null
      ) {
        if (
          typeof g_performance.SectorsSettings[miesto[7]] != "undefined" &&
          g_performance.SectorsSettings[miesto[7]] != null
        ) {
          var set = g_performance.SectorsSettings[miesto[7]];
          if (set == 2 || set == 3) overSektor = false;
        }
      }

      if (SektorPocetUvolnenych[miesto[7]] > 15 && overSektor) {
        if (isnull(skupiny[cislo_skupiny])) skupiny[cislo_skupiny] = miesto[7];
      }
    }
  }

  for (var cislo_skupiny in skupiny) {
    var id_sektor = skupiny[cislo_skupiny];
    var ok = true;
    var regular = "#";
    for (var poradie_radu in Sektory[id_sektor]) {
      var rad = Sektory[id_sektor][poradie_radu];
      for (var poradie_miesta in rad) {
        var miesto = rad[poradie_miesta];
        if (miesto[9] == cislo_skupiny) {
          var idmj = miesto[0];
          var stav = 0;
          if (
            m[idmj][1] == 1 ||
            m[idmj][1] == 2 ||
            m[idmj][1] == 3 ||
            oznacene[idmj] == 1
          ) {
            if (isnull(oznacene[idmj]) == true) {
              stav = 2;
            } else {
              if (oznacene[idmj] == 1) stav = 1;
              else stav = 0;
            }
          }
          regular += "" + stav;
          ok = false;
        } else {
          if (ok == false) break;
        }
      }
      if (ok == false) break;
    }
    regular = regular + "#";
    var volne_skupiny = Sektor_get_groups(id_sektor);

    if (regular.indexOf("#01") != -1) {
      if (
        !(
          regular.indexOf("#012") != -1 ||
          regular.indexOf("#0112") != -1 ||
          regular.indexOf("#01112") != -1 ||
          regular.indexOf("#011112") != -1 ||
          regular.indexOf("#0111112") != -1 ||
          regular.indexOf("#01111112") != -1 ||
          regular.indexOf("#011111112") != -1 ||
          regular.indexOf("#0111111112") != -1
        )
      ) {
        if (
          OverCiMozeInde("#01", regular.indexOf("#01"), regular, volne_skupiny)
        ) {
          return "#01";
        }
      }
    }
    if (regular.indexOf("10#") != -1) {
      if (
        !(
          regular.indexOf("210#") != -1 ||
          regular.indexOf("2110#") != -1 ||
          regular.indexOf("21110#") != -1 ||
          regular.indexOf("211110#") != -1 ||
          regular.indexOf("2111110#") != -1 ||
          regular.indexOf("21111110#") != -1 ||
          regular.indexOf("211111110#") != -1 ||
          regular.indexOf("2111111110#") != -1
        )
      ) {
        if (
          OverCiMozeInde("10#", regular.indexOf("10#"), regular, volne_skupiny)
        ) {
          return "10#";
        }
      }
    }
    if (regular.indexOf("201") != -1) {
      if (
        !(
          regular.indexOf("2012") != -1 ||
          regular.indexOf("20112") != -1 ||
          regular.indexOf("201112") != -1 ||
          regular.indexOf("2011112") != -1 ||
          regular.indexOf("20111112") != -1 ||
          regular.indexOf("201111112") != -1 ||
          regular.indexOf("2011111112") != -1 ||
          regular.indexOf("2011111112") != -1
        )
      ) {
        if (
          OverCiMozeInde("201", regular.indexOf("201"), regular, volne_skupiny)
        ) {
          return "201";
        }
      }
    }
    if (regular.indexOf("102") != -1) {
      if (
        !(
          regular.indexOf("2102") != -1 ||
          regular.indexOf("21102") != -1 ||
          regular.indexOf("211102") != -1 ||
          regular.indexOf("2111102") != -1 ||
          regular.indexOf("21111102") != -1 ||
          regular.indexOf("211111102") != -1 ||
          regular.indexOf("2111111102") != -1 ||
          regular.indexOf("21111111102") != -1
        )
      ) {
        if (
          OverCiMozeInde("102", regular.indexOf("102"), regular, volne_skupiny)
        ) {
          return "102";
        }
      }
    }
    if (regular.indexOf("101") != -1) {
      return "101";
    }
    //alert(regular);
    //console.log(regular);
    return "";
  }

  return "";
}

function OverMedzeryMsg(msg) {
  if (ok_medzery != "") {
    if (typeof msg != "undefined" && msg == false);
    else {
      alert(lang["MS2019_MiestaNevynechavat"]);
      $("#hladisko-basket-btn").addClass("disabled");
    }

    $.ajax({
      url: absoluteUri + "OverMedzery/" + g_performance.ID + "/False",
      cache: false,
      statusCode: {
        404: function () {
          alert("Page not found.");
        },
        500: function () {
          alert("Internal server error.");
        },
      },
    }).done(function (data) {});
  } else {
    $("#hladisko-basket-btn").removeClass("disabled");

    $.ajax({
      url: absoluteUri + "OverMedzery/" + g_performance.ID + "/True",
      cache: false,
      statusCode: {
        404: function () {
          alert("Page not found.");
        },
        500: function () {
          alert("Internal server error.");
        },
      },
    }).done(function (data) {});
  }
}

function OverCiMozeInde(err_regex, index, regular, volne_skupiny) {
  var pocet = ZistiPocetIznacenychVSkupine(err_regex, index, regular);
  var pocet_inde = 0;

  for (var i in volne_skupiny) {
    var velkost = volne_skupiny[i].length;

    if (velkost == pocet || velkost > pocet + 2) pocet_inde++;
  }
  return pocet_inde >= 2;
}
function ZistiPocetIznacenychVSkupine(err_regex, index, regular) {
  var pocet = 0;
  if (err_regex[0] == "1") {
    for (var i = index; i >= 0; i--) {
      if (regular[i] == "1") pocet++;
      else break;
    }
  }
  if (err_regex[2] == "1") {
    for (var i = index + 2; index < regular.length; i++) {
      if (regular[i] == "1") pocet++;
      else break;
    }
  }
  return pocet;
}
