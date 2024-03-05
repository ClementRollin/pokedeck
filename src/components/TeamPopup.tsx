import { Pokemon } from "./PokeList";

interface TeamPopupProps {
    team: string[];
    pokemons: Pokemon[];
    onClose: () => void;
}

const TeamPopup: React.FC<TeamPopupProps> = ({ team, pokemons, onClose }) => {

    
    return (
        <div className="teamPopup">
            <h2>Mon équipe</h2>
            <div className="teamGrid">
                {team.map(pokemonName => {
                    const pokemon = pokemons.find(p => p.name === pokemonName);
                    return pokemon ? (
                        <div key={pokemonName}>
                            <img src={pokemon.imageUrl} alt={pokemonName} />
                            <p>{pokemonName}</p>
                        </div>
                    ) : null;
                })}
            </div>
            <button onClick={onClose}>Fermer</button>
        </div>
    );
};

export default TeamPopup;