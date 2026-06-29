

import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const useConvexQuery = (query, ...args) => {
  const result = useQuery(query, ...args);
  const [data, setData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use effect to handle the state changes based on the query result
  
  
  useEffect(() => {
    if (result === undefined) {
     
      setIsLoading(true);
    } else {

      try {
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    // console.log("useconvex query run hua");
    // console.log(result);
    
  }, [result]);

  return {
    data,
    isLoading,
    error,
  };
};

export const useConvexMutation = (mutation) => {   
  const mutationFn = useMutation(mutation);   //mutationFn=useMutation(api.users.deleteValues)
  const [data, setData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (...args) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await mutationFn(...args);
      setData(response);
      return response;
    } catch (err) {
      setError(err);
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, data, isLoading, error };
};




// It’s a custom React hook that wraps Convex’s useMutation.
// It standardizes mutation calls by giving you:

// mutate → function you call to trigger the mutation

// data → last successful response

// isLoading → whether the mutation is in progress

// error → error state if mutation fails

// 🛠 Code Breakdown
// const mutationFn = useMutation(mutation);


// useMutation(mutation) returns a function that, when called, will run the Convex mutation on the server.

// Example: if you pass in api.users.deleteValues, then mutationFn is that delete mutation.

// const [data, setData] = useState(undefined);
// const [isLoading, setIsLoading] = useState(false);
// const [error, setError] = useState(null);


// Local React state to track:

// data → stores the mutation’s result when it succeeds.

// isLoading → true only while the mutation is running.

// error → stores error info if mutation fails.

// const mutate = async (...args) => {
//   setIsLoading(true);
//   setError(null);

//   try {
//     const response = await mutationFn(...args);
//     setData(response);
//     return response;
//   } catch (err) {
//     setError(err);
//     toast.error(err.message);
//     throw err;
//   } finally {
//     setIsLoading(false);
//   }
// };


// Defines the mutate function that components will call.

// Steps:

// Before running → set isLoading = true and clear old errors.

// Run the actual Convex mutation (mutationFn).

// If successful → save result into data and return it (so the caller can also use it).

// If error → set error, show a toast (toast.error), and rethrow so caller can still catch it.

// Finally → set isLoading = false to end the loading state.

// return { mutate, data, isLoading, error };


// Returns everything the component needs to use this mutation in a consistent interface.