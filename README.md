# NP 1v1 League System

A turn-based 1v1 league and tournament system designed for competitive gameplay with automated game management, player ratings, and Discord integration.

## Overview

The NP 1v1 League System facilitates organized competitive play through:

- **Monthly Leagues**: All participating players are paired each month for competitive matches
- **Quarterly Tournaments**: Single-elimination tournaments held every three months (January, April, July, October)
- **Game Management**: Automated game creation with unique passwords and player notifications
- **Rating System**: Player skill tracking and rating-based matchmaking
- **Discord Integration**: Seamless tournament/league management through Discord bot
- **Game Recording**: Complete game history with replay functionality

## Key Features

### Tournament System
- Single-elimination format running quarterly
- Month-long signup period before each tournament
- Random or rating-based seeding
- Automated bracket generation and management
- Bye assignments for odd numbers of players
- October tournament includes additional top 4 playoff from league finishers

### League System  
- Monthly game creation for all opted-in players
- Two-week signup window before each month
- Rating-based or random player matching
- Game format preferences (1 game, best of 3, or best of 5)
- Preferential matching of players with same format preference
- Bye assignments needed when there are an odd number of players
- Continuous or periodic participation options

### Game Management
- Unique, memorable password generation (adjective-noun combinations)
- Automated player notifications when games are ready
- Complete game result recording and history
- Player identity verification between Discord and game platforms

### Rating & Analytics
- Glicko rating system for skill assessment
- Comprehensive result viewing by player, tournament, or league
- Historical performance tracking
- Rating-based matchmaking optimization

## Project Status

🚧 **This project is in early development.** 

The initial implementation will focus on a Discord bot providing basic tournament functionality. See [ROADMAP.md](ROADMAP.md) for detailed development plans.

## Architecture

The system consists of:
- **Discord Bot**: Primary user interface for signups, notifications, and results
- **Game Server**: Backend logic for tournament/league management and game coordination
- **Database**: Player profiles, game results, ratings, and tournament/league data
- **Web Interface**: (Future) Comprehensive viewing of results and statistics with Discord federated login

See [DESIGN_SKETCH.md](DESIGN_SKETCH.md) for detailed technical architecture.

## Getting Started

*Documentation will be updated as development progresses.*

### Prerequisites
- Discord server access
- Node.js (for Discord bot)
- Database system (PostgreSQL recommended)

### Installation
*Coming soon*

## Contributing

This project is open source under the GPL v3 license. Contributions are welcome!

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.