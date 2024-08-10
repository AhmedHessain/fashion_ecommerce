"use client";
import { useDispatch, useSelector } from "react-redux";
import { increment } from "@/lib/counter/slice";
export default function Home() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();
  return (
    <>
      <h1>Counter :{count}</h1>
      <button
        className="bg-slate-100 text-black"
        onClick={() => {
          dispatch(increment());
        }}
      >
        increment
      </button>
    </>
  );
}
