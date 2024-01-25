import PokeList from "./components/PokeList.tsx"; // Importez votre composant PokeList
import './App.css';

function App() {
    return (
        <>
            <h1>Pokedeck</h1>
            <PokeList /> {/* Affiche la liste des Pokémon */}
            <p className="read-the-docs">
                Découvrez les différents Pokémon !
            </p>
        </>
    );
}

export default App;