import "./styles.css";
import { toCoords, getData } from "./data";

function geoSuccess(pos) {
  const crd = pos.coords;
  getData(`lat=${crd.latitude}&lon=${crd.longitude}`);
}

(function () {
  const search = document.getElementById("search");
  search.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      try {
        const coords = await toCoords(search.value);
        await getData(coords);
      } catch (error) {
        console.error("Error processing search:", error);
      }
    }
  });

  getData(`lat=40.7127&lon=-74.0059`);
  navigator.geolocation.getCurrentPosition(geoSuccess, () =>
    console.log("Geolocation failed"),
  );
})();
