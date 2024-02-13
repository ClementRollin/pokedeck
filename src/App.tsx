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