import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

import { State, City } from "country-state-city";

const App = () => {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [long, setLong] = useState("");
  const [lat, setLat] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [precipitationData, setPrecipitationData] = useState(null);
  const states = State.getStatesOfCountry("DZ");
  const cities = City.getCitiesOfState("DZ", state);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [errors, setErrors] = useState({});

  console.log(errors);
  console.log(startDate);

  useEffect(() => {
    renderBarGraph();
  }, [precipitationData]);

  useEffect(() => {
    if (selectedCity) {
      setLong(selectedCity.longitude);
      setLat(selectedCity.latitude);
    }
  }, [selectedCity]);

  const handleForm = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    const errors = {};
    try {
      if (!state && state.length === 0) {
        errors.state = "Veuillez sélectionner une Wilaya.";
      }

      if (!city && city.length === 0) {
        errors.city = "Veuillez sélectionner une ville.";
      }

      if (!long && long.length === 0) {
        errors.long = "La longitude est requise.";
      }

      if (!lat && lat.length === 0) {
        errors.lat = "La latitude est requise.";
      }

      if (!startDate && startDate.length === 0) {
        errors.startDate = "La date de début est requise.";
      }

      if (!endDate && endDate.length === 0) {
        errors.endDate = "La date de fin est requise.";
      }

      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${parseFloat(
          lat
        )}&longitude=${parseFloat(
          long
        )}&start_date=${startDate}&end_date=${endDate}&daily=rain_sum,windspeed_10m_max&timezone=Europe%2FLondon&min=2023-01-01&max=2023-06-11`
      );
      const data = await response.json();
      if (isNaN(parseFloat(lat)) || isNaN(parseFloat(long))) {
        console.log("Invalid latitude or longitude");
        return;
      }
      setErrors({});
      setLong("");
      setLat("");
      setStartDate("");
      setEndDate("");
      setPrecipitationData(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderBarGraph = () => {
    if (!precipitationData) {
      return null;
    }

    const labels = precipitationData.daily.time.map((date) => {
      const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      return formattedDate;
    });
    const precipitation = precipitationData.daily.rain_sum;
    const windSpeed = precipitationData.daily.windspeed_10m_max;

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "Somme de pluie",
          data: precipitation,
          borderColor: "rgb(20,184,166)",
          backgroundColor: "rgba(20,184,166,0.3)",
          tension: 0.5,
          fill: true,
        },
        {
          label: "Vitesse du vent",
          data: windSpeed,
          borderColor: "rgb(153,0,255)",
          backgroundColor: "rgba(153,0,255, 0.3)",
          tension: 0.5,
          fill: true,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 2,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Somme de pluie (mm)",
            color: "#ffffff",
          },
        },
        x: {
          title: {
            display: true,
            text: "Date",
            color: "#ffffff",
          },
        },
      },

      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const datasetLabel = context.dataset.label || "";
              const value = context.parsed.y || 0;
              const unit = datasetLabel === "Somme de pluie" ? " mm" : " km";

              return datasetLabel + ": " + value.toFixed(2) + unit;
            },
          },
        },
      },
    };

    return <Line data={chartData} options={options} />;
  };

  return (
    <>
      <nav className="w-full h-16 bg-[#1d1e20] flex items-center justify-center shadow-sm mb-10">
        <a href="/" className="text-2xl font-bold tracking-tight text-white">
          Aqua<span className="text-teal-500">Graph</span>
        </a>
      </nav>
      <div className="w-full flex items-center flex-col px-5">
        <h1 className="font-bold text-2xl md:text-3xl text-center mb-3 text-[#1d1e20]">
          Analyse de la quantité de pluie et de la vitesse du vent.
        </h1>
        <p className="text-center mb-10 md:w-1/2 leading-6 text-gray-500">
          Veuillez entrer les informations requises pour générer un graphique de
          la quantité de pluie et de la vitesse du vent.
        </p>
      </div>
      {/* Input Group */}
      <form
        className="w-full flex flex-col items-center justify-center mb-10 px-5"
        onSubmit={handleForm}
      >
        <div className="w-full md:w-1/2 flex gap-4 mb-4">
          <div className="flex flex-col gap-2 w-full mb-2 relative">
            <label htmlFor="state" className="text-sm font-semibold">
              Sélectionnez la Wilaya
            </label>
            <select
              name="state"
              id="state"
              className={`p-4 outline-none bg-gray-100 rounded-xl w-full  border ${
                errors.state ? "border border-red-500" : "border-gray-300"
              }`}
              onChange={(e) => setState(e.target.value)}
            >
              <option></option>
              {states.map((s) => (
                <option key={s.isoCode} value={s.isoCode}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.state && <p className="text-red-500">{errors.state}</p>}
          </div>
          <div className="flex flex-col gap-2 w-full mb-2 relative">
            <label htmlFor="city" className="text-sm font-semibold">
              Sélectionnez la Ville
            </label>
            <select
              name=""
              id="city"
              className={`p-4 outline-none bg-gray-100 rounded-xl w-full  border ${
                errors.city ? "border border-red-500" : "border-gray-300"
              }`}
              onChange={(e) => {
                setCity(e.target.value);
                setSelectedCity(
                  cities.find((city) => city.name === e.target.value)
                );
              }}
            >
              <option></option>
              {cities.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.city && <p className="text-red-500">{errors.city}</p>}
          </div>
        </div>

        <div className="w-full md:w-1/2 flex gap-4 mb-4">
          <div className="flex flex-col gap-2 w-full mb-2">
            <label htmlFor="long" className="text-sm font-semibold">
              Longitude
            </label>
            <input
              type="text"
              name="long"
              id="long"
              className={`p-4 outline-none bg-gray-100 rounded-xl w-full  border ${
                errors.long ? "border border-red-500" : "border-gray-300"
              }`}
              onChange={(e) => setLong(e.target.value)}
              value={long}
            />
            {errors.long && <p className="text-red-500">{errors.long}</p>}
          </div>
          <div className="flex flex-col gap-2 w-full mb-2">
            <label htmlFor="lat" className="text-sm font-semibold">
              Latitude
            </label>
            <input
              type="text"
              name="lat"
              id="lat"
              className={`p-4 outline-none bg-gray-100 rounded-xl w-full border ${
                errors.lat ? "border border-red-500" : "border-gray-300"
              }`}
              onChange={(e) => setLat(e.target.value)}
              value={lat}
            />
            {errors.lat && <p className="text-red-500">{errors.lat}</p>}
          </div>
        </div>

        <div className="w-full md:w-1/2 flex gap-4 mb-4">
          <div className="flex flex-col gap-2 w-full mb-2">
            <label htmlFor="startDate" className="text-sm font-semibold">
              Date de début
            </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              className={`p-4 outline-none bg-gray-100 rounded-xl w-full  border ${
                errors.startDate ? "border border-red-500" : "border-gray-300"
              }`}
              onChange={(e) => setStartDate(e.target.value)}
              value={startDate}
            />
            {errors.startDate && (
              <p className="text-red-500">{errors.startDate}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full mb-2">
            <label htmlFor="endDate" className="text-sm font-semibold">
              Date de fin
            </label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              className={`p-4 outline-none bg-gray-100 rounded-xl w-full  border ${
                errors.endDate ? "border border-red-500" : "border-gray-300"
              }`}
              onChange={(e) => setEndDate(e.target.value)}
              value={endDate}
            />
            {errors.endDate && <p className="text-red-500">{errors.endDate}</p>}
          </div>
        </div>
        <button
          disabled={isLoading}
          className={`w-full md:w-1/2 p-4 rounded-xl hover:bg-teal-600 transition duration-500 ${
            isLoading ? "bg-teal-500/50" : "bg-teal-500"
          } text-white font-semibold`}
        >
          {isLoading ? "Aperçu les données..." : " Aperçu les données"}
        </button>
      </form>
      {/* Graph */}
      {precipitationData && (
        <>
          <h3 className="mb-4 px-5 text-center text-xl md:text-2xl font-bold">
            Quantité de pluie et de la vitesse du vent à{" "}
            {city === "Algiers" ? "Alger" : city}
          </h3>
          <div className="w-full px-5">
            <div className="bg-white shadow-2xl min-h-[500px] rounded-xl">
              {renderBarGraph()}
            </div>
          </div>
        </>
      )}

      <footer className="mt-20 flex items-center justify-center p-5">
        <p className="text-center">
          Cette application a été développée par{" "}
          <a href="#" className="text-teal-500 font-bold">
            Loqman Djefafla
          </a>
        </p>
      </footer>
    </>
  );
};

export default App;
