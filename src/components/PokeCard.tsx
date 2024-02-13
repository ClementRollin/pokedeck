import { useEffect, useState } from 'react';
import axios from 'axios';

const PokeCard = ({ pokemon }: { pokemon: any }) => {
    const [frenchName, setFrenchName] = useState('');

    useEffect(() => {
        const fetchPokemonSpecies = async () => {
            try {
                const response = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.name}`);
                const frenchNameObj = response.data.names.find((name: { language: { name: string } }) => name.language.name === 'fr');
                if (frenchNameObj) {
                    setFrenchName(frenchNameObj.name);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération du nom français du Pokémon", error);
            }
        };

        fetchPokemonSpecies();
    }, [pokemon]);

    return (
        <div>
            <h2>{frenchName || pokemon.name}</h2>
            {pokemon.imageUrl && <img src={pokemon.imageUrl} alt={pokemon.name} />}
        </div>
    );
};

export default PokeCard;
