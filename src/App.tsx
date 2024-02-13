import PokeList from "./components/PokeList.tsx";
import './App.css';

function App() {
    return (
        <>
            <h1>Pokedex</h1>
            <PokeList />
            <p className="read-the-docs">
                Découvrez les différents Pokémon !
            </p>
        </>
    );
}

export default App;

////////////////////////////////////////
// FONCTION COUNT => COMPTER LES CLICKS //
////////////////////////////////////////

/*import React, { useState, useEffect } from 'react';
function App() {
  const [count, SetCount] = useState(0)

  const increment = () => {
      SetCount(count + 1);
      console.log('incremented', count)
  }
  useEffect(() => {
    setInterval(increment, 3000);
  }, [])  
    return (
        <button onClick={(increment)}>Compteur : {count} double : {count *2}</button>
    );
}
export default App;*/