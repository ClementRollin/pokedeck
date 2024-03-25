// RemovePokemonPopup.tsx
import { useState } from 'react';

interface RemovePokemonPopupProps {
    team: string[];
    onRemovePokemon: (pokemon: string) => void;
    onClose: () => void;
}

const RemovePokemonPopup: React.FC<RemovePokemonPopupProps> = ({ team, onRemovePokemon, onClose }) => {
    const [pokemonToRemove, setPokemonToRemove] = useState<string | null>(null);

    const handleRemovePokemon = () => {
        if (pokemonToRemove) {
            onRemovePokemon(pokemonToRemove);
            onClose();
        }
    };

    return (
        <>
            <div className="backdrop" onClick={onClose}></div>
            <div className="remove-pokemon-popup">
                <h2>Supprimer un Pokémon</h2>
                {team.map((pokemon, index) => (
                    <div key={index}>
                        <input type="radio" id={pokemon} name="pokemon" value={pokemon} onChange={() => setPokemonToRemove(pokemon)} />
                        <label htmlFor={pokemon}>{pokemon}</label>
                    </div>
                ))}
                <button onClick={handleRemovePokemon}>Supprimer le Pokémon sélectionné</button>
                <button onClick={onClose}>Annuler</button>
            </div>
        </>
    );
};

export default RemovePokemonPopup;