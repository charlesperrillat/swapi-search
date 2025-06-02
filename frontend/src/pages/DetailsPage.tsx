import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { capitalizeFirstLetter, formatKeyName } from "../utils";

const DetailsPage = () => {
  const navigate = useNavigate();
  const { type, id } = useParams<{ type: string; id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // function to get the name or title of the related items
  const fetchLabelFromUrl = async (url: string): Promise<string> => {
    try {
      const res = await axios.get(url);
      return res.data.name || res.data.title || "Unknown";
    } catch {
      return "Unknown";
    }
  };

  const fetch = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:3000/search/details/${type}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const rawData = res.data;

      // replace url by the name or title of the item
      const entries = await Promise.all(
        Object.entries(rawData).map(async ([key, value]) => {
          if (
            Array.isArray(value) &&
            typeof value[0] === "string" &&
            value[0].startsWith("https")
          ) {
            const labels = await Promise.all(value.map(fetchLabelFromUrl));
            return [key, labels];
          } else if (typeof value === "string" && value.startsWith("https")) {
            const label = await fetchLabelFromUrl(value);
            return [key, label];
          }
          return [key, value];
        })
      );

      setData(Object.fromEntries(entries));
    } catch (err) {
      setError("Error while loading data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type && id) fetch();
  }, [type, id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!data) return <p className="p-4">No data found.</p>;

  const excludedKeys = ["created", "edited", "url"];

  const displayedFields = Object.entries(data)
    .filter(([key]) => !excludedKeys.includes(key.toLowerCase()))
    .map(([key, value]) => ({
      label: formatKeyName(key) || capitalizeFirstLetter(key),
      value,
      key,
    }));

  return (
    <div className="px-2 py-8 w-full mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-[#fade4b] hover:underline cursor-pointer mb-4 block"
      >
        ← Back to search
      </button>

      <h1 className="text-2xl font-bold mb-4 capitalize">
        {type}: {data?.name || data?.title}
      </h1>
      <div className="rounded shadow p-4 space-y-2">
        {displayedFields.map(({ key, label, value }) => (
          <div key={key}>
            <span className="font-semibold">{label}:</span>{" "}
            {Array.isArray(value) ? (
              value.length === 0 ? (
                <span className="italic text-gray-500">None</span>
              ) : (
                <ul className="list-disc list-inside ml-4 mt-1">
                  {value.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )
            ) : typeof value === "string" ? (
              <span>{value}</span>
            ) : (
              <span>{JSON.stringify(value)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetailsPage;
