# Design Sketch - NP 1v1 League System

This document outlines the technical architecture and design decisions for the NP 1v1 League System.

## System Architecture

### High-Level Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Discord Bot   │    │   Web Interface │    │   Game Client   │
│                 │    │   (Future)      │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │     Game Server         │
                    │   - Tournament Logic    │
                    │   - League Management   │
                    │   - Game Coordination   │
                    │   - Rating Calculations │
                    └─────────────┬───────────┘
                                  │
                    ┌─────────────┴───────────┐
                    │      Database           │
                    │   - Player Profiles     │
                    │   - Game Results        │
                    │   - Tournament Data     │
                    │   - League History      │
                    └─────────────────────────┘
```

## Core Systems

### 1. Tournament Management

**Tournament Lifecycle:**
1. **Signup Phase** (1 month): Players register for upcoming tournament
2. **Bracket Generation**: Random or seeded bracket creation
3. **Game Execution**: Progressive rounds with automated notifications
4. **Result Recording**: Winner advancement and rating updates

**Key Components:**
- Tournament scheduler (quarterly activation)
- Bracket generator with bye handling
- Round progression logic
- Result validation and recording

### 2. League Management

**League Lifecycle:**
1. **Signup Window** (2 weeks before month): Player registration
2. **Pairing Generation**: Rating-based or random matchmaking
3. **Game Month**: Parallel game execution
4. **Results Processing**: Rating updates and statistics

**Key Components:**
- Monthly league scheduler
- Matchmaking algorithm (rating-aware)
- Parallel game coordination
- Continuous enrollment management

### 3. Game Coordination

**Game Flow:**
1. **Game Creation**: Generate unique game with password
2. **Player Notification**: Discord messages with game details
3. **Identity Verification**: Link Discord users to game players
4. **Result Collection**: Automated or manual result reporting
5. **Data Storage**: Persistent game history

**Password Generation:**
- Format: `[adjective]-[noun]` (e.g., "swift-falcon", "mighty-oak")
- Ensures memorable, unique identifiers
- Simple positive word combinations

### 4. Rating System

**Glicko Rating Implementation:**
- Initial rating: 1500 ± 350 RD (Rating Deviation)
- Rating updates after each game
- Uncertainty increases over time without play
- Matchmaking uses rating ± deviation for fairness

**Rating Applications:**
- Tournament seeding (higher rated players get byes)
- League matchmaking (similar skill pairing)
- Performance tracking and leaderboards
- Skill-based game balance

## Data Models

### Core Entities

```sql
-- Players
Players:
  - id (primary key)
  - discord_id (unique)
  - username
  - rating (Glicko rating)
  - rating_deviation (Glicko RD)
  - last_played_date
  - created_at

-- Tournaments
Tournaments:
  - id (primary key)
  - name
  - start_date
  - signup_deadline
  - status (signup, active, completed)
  - bracket_data (JSON)

-- Tournament Participants
TournamentParticipants:
  - tournament_id (foreign key)
  - player_id (foreign key)
  - seed_position
  - eliminated_in_round

-- Games
Games:
  - id (primary key)
  - password
  - tournament_id (nullable)
  - league_month (nullable)
  - player1_id (foreign key)
  - player2_id (foreign key)
  - winner_id (foreign key, nullable)
  - status (created, active, completed)
  - created_at
  - completed_at

-- League Participations
LeagueParticipations:
  - id (primary key)
  - player_id (foreign key)
  - month_year
  - opted_in_date
```

## Discord Bot Design

### Command Structure

```
/tournament
  ├── signup - Register for upcoming tournament
  ├── bracket - View current tournament bracket
  └── results - View tournament results

/league
  ├── signup - Register for upcoming month
  ├── optout - Disable continuous participation
  └── results - View monthly league results

/game
  ├── status - Check your active games
  └── report - Report game result (admin/verification)

/player
  ├── stats - View your rating and game history
  └── ranking - View global player rankings
```

### Event Handling

**Scheduled Events:**
- Tournament announcements (quarterly)
- League signup reminders (bi-weekly)
- Game ready notifications (immediate)
- Result announcements (post-game)

**User Interactions:**
- Signup confirmations
- Game password delivery
- Identity verification prompts
- Result reporting workflows

## Technology Stack

### Backend
- **Language**: Node.js/TypeScript or Python
- **Database**: PostgreSQL (structured data) + Redis (caching)
- **Discord**: discord.js library
- **Scheduling**: node-cron or similar
- **Rating**: Custom Glicko implementation

### Future Web Interface
- **Frontend**: React/Next.js
- **API**: REST or GraphQL
- **Authentication**: Discord OAuth

## Scalability Considerations

### Performance
- Database indexing on frequently queried fields
- Caching of rating calculations and leaderboards
- Batch processing for large tournament operations

### Reliability
- Graceful error handling for Discord API limits
- Backup and recovery procedures
- Monitoring and logging for system health

### Extensibility
- Plugin architecture for different game types (2v2, 3v3, FFA)
- Configurable tournament formats
- Multiple Discord server support

## Security & Privacy

### Data Protection
- Minimal data collection (Discord ID, game results only)
- Secure password generation and transmission
- Regular data backups with encryption

### Access Control
- Role-based permissions in Discord
- Admin controls for tournament management
- Player data privacy controls

## Future Enhancements

### Phase 2: Web Interface
- Comprehensive statistics and analytics
- Historical data visualization
- Advanced tournament bracket viewing
- Mobile-responsive design

### Phase 3: Advanced Features
- Multiple game type support
- Custom tournament formats
- Team-based competitions
- Integration with game replay systems
- Real-time spectator features