"use client";
import { MoonLoader } from "react-spinners";
import { CSSProperties } from "react";

type VideoType = {
    title: string;
    thumbnail: string;
    views: number;
    likes: number;
    url: string;
}

type LoadingTypes = {
    Clearing: boolean;
    Removing: boolean;
    Summerizing: boolean;
    Indexing: boolean;
}

export default function VideoCard({ 
    video,Clearing,Removing,Summerizing,Indexing 
}:{video:VideoType}&LoadingTypes) {
  return (
    <div className="border h-96 rounded-lg overflow-hidden shadow-md grid grid-cols-3 m-3 p-3">
      <img
        alt={video.title}
        src={video.thumbnail}
        className="w-full h-full object-cover"
      />
      <div className="p-4 col-span-2">
        <h1 className="font-bold text-lg mb-2">{video.title}</h1>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{video.views.toLocaleString()} views</span>
          <span>{video.likes.toLocaleString()} likes</span>
        </div>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Watch Video
        </a>
        <div className="border-3 rounded-t-2xl">
          <div className="text-white bg-gray-900 text-2xl font-extrabold rounded-t-2xl p-3">
            working with comments
          </div>
          <div>
            <ul>
              <li className="flex items-center">
                {Clearing?<LoadingSpinner/>:<Tick />}
                Clearing nice and emojis
              </li>
              <li className="flex items-center">
                {Removing?<LoadingSpinner/>:<Tick />}
                Removing irrelevent comments
              </li>
              <li className="flex items-center">
                {Summerizing?<LoadingSpinner/>:<Tick />}
                Summerizing
              </li>
              <li className="flex items-center">
                {Indexing?<LoadingSpinner/>:<Tick />}
                Indexing
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
    const override: CSSProperties = {
        display: "block",
        margin: "0",
        borderColor: "red",
    };
    return (
        <MoonLoader
        color={"black"}
        loading={true}
        cssOverride={override}
        size={20}
        aria-label="Loading Spinner"
        data-testid="loader"
        />
    );
}

function Tick() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="30"
      height="30"
      viewBox="0 0 48 48"
    >
      <path
        fill="#c8e6c9"
        d="M36,42H12c-3.314,0-6-2.686-6-6V12c0-3.314,2.686-6,6-6h24c3.314,0,6,2.686,6,6v24C42,39.314,39.314,42,36,42z"
      ></path>
      <path
        fill="#4caf50"
        d="M34.585 14.586L21.014 28.172 15.413 22.584 12.587 25.416 21.019 33.828 37.415 17.414z"
      ></path>
    </svg>
  );
}
