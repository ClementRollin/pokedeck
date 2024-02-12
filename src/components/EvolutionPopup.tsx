import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pokemon } from './PokeList';

interface EvolutionPopupProps {
    pokemonId: string;
    pokemonDetails: Pokemon;
    onClose: () => void;
}

interface EvolutionNode {
    species: {
        name: string;
        url: string;
    };
    evolves_to: EvolutionNode[];
}

interface EvolutionDetail {
    name: string;
    imageUrl: string;
}

const EvolutionPopup: React.FC<EvolutionPopupProps> = ({ pokemonId, pokemonDetails, onClose }) => {
    const [evolutionDetails, setEvolutionDetails] = useState<EvolutionDetail[]>([]);

    useEffect(() => {
        const fetchEvolutionChain = async () => {
            try {
                // Extrait l'ID numérique de la chaîne d'évolution depuis l'URL passée en props
                const idMatch = pokemonId.match(/\/(\d+)\//);
                if (idMatch) {
                    const id = idMatch[1];
                    const { data } = await axios.get(`https://pokeapi.co/api/v2/evolution-chain/${id}/`);
                    await processEvolutionChain(data.chain);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de la chaîne d'évolution:", error);
            }
        };

        const processEvolutionChain = async (evolutionNode: EvolutionNode) => {
            let evolutions: EvolutionDetail[] = [];
            let currentEvolution: EvolutionNode | null = evolutionNode;

            while (currentEvolution) {
                const speciesUrl = currentEvolution.species.url;
                const speciesData = await axios.get(speciesUrl);
                const pokemonData = await axios.get(`https://pokeapi.co/api/v2/pokemon/${speciesData.data.name}`);
                evolutions.push({
                    name: pokemonData.data.name,
                    imageUrl: pokemonData.data.sprites.front_default || 'default-image-url.png',
                });

                currentEvolution = currentEvolution.evolves_to[0] || null;
            }

            setEvolutionDetails(evolutions);
        };

        fetchEvolutionChain();
    }, [pokemonId]);

    return (
        <div className="evolution-popup">
            <h2>Détails du Pokémon</h2>
            <div>
                <h3>{pokemonDetails.name}</h3>
                <img src={pokemonDetails.imageUrl} alt={pokemonDetails.name} />
                <p>Types: {pokemonDetails.types.join(', ')}</p>
            </div>
            <h2>Évolutions</h2>
            <div className="evolutionPokemon">
                {evolutionDetails.map((evolution, index) => (
                    <div key={index} className="evolution-item">
                        <h4>{evolution.name}</h4>
                        <img src={evolution.imageUrl} alt={evolution.name} />
                    </div>
                ))}
            </div>
            <button onClick={onClose}>Fermer</button>
        </div>
    );
};

export default EvolutionPopup;