import { useState, useEffect } from 'react';
import axios from 'axios';
import {Pokemon} from "./PokeList.tsx";

interface EvolutionPopupProps {
    pokemonId: string;
    pokemonDetails: Pokemon;
    onClose: () => void;
}

interface EvolutionDetail {
    name: string;
    imageUrl: string;
}

const EvolutionPopup = ({ pokemonId, onClose, pokemonDetails }: EvolutionPopupProps) => {
    const [evolutionDetails, setEvolutionDetails] = useState<EvolutionDetail[]>([]);

    useEffect(() => {
        const fetchEvolutionChain = async () => {
            try {
                const idMatch = pokemonId.match(/pokemon\/(\d+)\//);
                if (idMatch) {
                    const id = idMatch[1];
                    const response = await axios.get(`https://pokeapi.co/api/v2/evolution-chain/${id}`);

                    const evolutions = [];
                    let currentEvolution = response.data.chain;
                    while (currentEvolution && currentEvolution.species) {
                        const evolutionResponse = await axios.get(currentEvolution.species.url);
                        const imageUrl = evolutionResponse.data.sprites?.front_default || 'default-image-url.png';
                        evolutions.push({
                            name: evolutionResponse.data.name,
                            imageUrl: imageUrl
                        });
                        currentEvolution = currentEvolution.evolves_to[0];
                    }
                    setEvolutionDetails(evolutions);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de la chaîne d'évolution:", error);
            }
        };

        fetchEvolutionChain();
    }, [pokemonId]);

    return (
        <div className="evolution-popup">
            <h2>Détails du Pokémon</h2>
            <div>
                <h3>{pokemonDetails.name}</h3>
                <img src={pokemonDetails.imageUrl} alt={pokemonDetails.name}/>
                <p>Types: {pokemonDetails.types.join(', ')}</p>
            </div>
            <h2>Évolutions</h2>
            {evolutionDetails.length > 0 ? (
                evolutionDetails.map((evolution, index) => (
                    <div key={index}>
                        <h4>Évolution {index + 1} : </h4>
                        <img src={evolution.imageUrl} alt={evolution.name}/>
                        <p>{evolution.name}</p>
                    </div>
                ))
            ) : (
                <p>Chargement des évolutions...</p>
            )}
            <button onClick={onClose}>Fermer</button>
        </div>
    );
};

export default EvolutionPopup;