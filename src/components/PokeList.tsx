import { useState, useEffect } from 'react';
import axios from 'axios';
import PokeCard from './PokeCard';
import EvolutionPopup from './EvolutionPopup';

export interface Pokemon {
    name: string;
    url: string;
}

const PokeList = () => {
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
    const [showEvolutionPopup, setShowEvolutionPopup] = useState(false);

    useEffect(() => {
        const fetchPokemons = async () => {
            const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=100');
            setPokemons(response.data.results);
        };

        fetchPokemons();
    }, []);

    const handleViewEvolutions = (pokemon: Pokemon) => {
        setSelectedPokemon(pokemon);
        setShowEvolutionPopup(true);
    };

    const handleClosePopup = () => {
        setShowEvolutionPopup(false);
        setSelectedPokemon(null);
    };

    return (
        <div>
            {pokemons.map(pokemon => (
                <div className={"lignes"} key={pokemon.name}>
                    <PokeCard pokemon={pokemon} />
                    <button onClick={() => handleViewEvolutions(pokemon)}>Voir Évolutions</button>
                </div>
            ))}
            {showEvolutionPopup && selectedPokemon && (
                <EvolutionPopup
                    pokemonId={selectedPokemon.url}
                    onClose={handleClosePopup}
                />
            )}
        </div>
    );
};

export default PokeList;