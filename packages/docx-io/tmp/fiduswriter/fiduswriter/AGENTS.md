# AGENTS.md

## Project Overview

**Fidus Writer** is an online collaborative editor designed for academics who need to use citations and/or formulas. The editor focuses on content rather than layout, allowing users to publish the same text in multiple formats (website, printed book, or ebook) with different appropriate layouts.

- **Repository**: https://github.com/fiduswriter/fiduswriter
- **License**: GNU AFFERO GENERAL PUBLIC LICENSE
- **Website**: http://fiduswriter.org

## Technology Stack

### Backend
- **Framework**: Django 5.2.9
- **ASGI Server**: Daphne 4.1.2
- **WebSockets**: Django Channels 4.3.2
- **Python Version**: Python 3.x
- **Database**: SQLite (default), with support for PostgreSQL and MySQL
- **Authentication**: django-allauth with social account support

### Frontend
- **JavaScript**: ES2015+ (transpiled automatically)
- **Module System**: ES6 modules (.mjs files)
- **Build Tool**: Rspack (via django-npm-mjs)
- **Editor**: ProseMirror (collaborative editing engine)
- **Math Rendering**: MathLive 0.104.0
- **Citations**: Citation Style Language (citeproc-plus)
- **Package Manager**: npm

### Key Dependencies
- `django-npm-mjs==3.3.0` - Handles JavaScript transpilation and npm integration
- `prosemirror==0.5.0` - Python bindings for ProseMirror
- `channels==4.3.2` - WebSocket support for real-time collaboration
- `Pillow==11.3.0` - Image processing
- `bleach==6.1.0` - HTML sanitization

## Project Structure

```
fiduswriter/
├── fiduswriter/                    # Main project directory
│   ├── base/                       # Core application (settings, management commands)
│   │   ├── management/commands/    # Django management commands
│   │   │   ├── bundle_mathlive.py
│   │   │   ├── collectstatic.py
│   │   │   ├── runserver.py
│   │   │   └── setup.py
│   │   ├── static/                 # Static files (CSS, images)
│   │   ├── templates/              # Django templates
│   │   ├── package.json5           # npm dependencies for base app
│   │   ├── rspack.config.template.js
│   │   └── settings.py             # Base Django settings
│   ├── document/                   # Document management app
│   │   ├── static/js/              # JavaScript modules
│   │   ├── consumers.py            # WebSocket consumers
│   │   └── package.json5           # Document-specific npm dependencies
│   ├── bibliography/               # Bibliography/citations management
│   ├── user/                       # User management
│   ├── usermedia/                  # User-uploaded media
│   ├── style/                      # Document styles
│   ├── .transpile/                 # Transpiled JavaScript (auto-generated)
│   ├── static-transpile/           # Transpiled output directory
│   ├── static-libs/                # Third-party static libraries
│   ├── manage.py                   # Django management script
│   ├── configuration.py            # User configuration (not in git)
│   └── configuration-default.py    # Default configuration template
├── README.md
└── setup.py                        # Package setup for pip installation
```

## Development Setup

### Prerequisites
- Python 3.x
- Node.js and npm (managed automatically by django-npm-mjs)
- Git

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/fiduswriter/fiduswriter.git
   cd fiduswriter
   ```

2. **Install Python dependencies**:
   ```bash
   cd fiduswriter
   pip install -r requirements.txt
   pip install -r dev-requirements.txt  # For development
   ```

3. **Create configuration file**:
   ```bash
   cp configuration-default.py configuration.py
   # Edit configuration.py with your settings
   ```

4. **Run setup command** (performs migrations, npm install, transpilation):
   ```bash
   python manage.py setup
   ```

5. **Create admin user**:
   ```bash
   python manage.py initadmin
   ```

6. **Run development server**:
   ```bash
   python manage.py runserver
   ```
   The server will be available at http://localhost:8000

## Build System & Transpilation

### JavaScript Transpilation

Fidus Writer uses **django-npm-mjs** to manage JavaScript dependencies and transpilation:

- **Package.json files**: Each Django app can have a `package.json5` file defining its npm dependencies
- **Transpiler**: Rspack (webpack-compatible bundler)
- **Output**: Transpiled files go to `static-transpile/` directory
- **Auto-transpilation**: During development, the runserver command watches for JavaScript file changes and automatically retranspiles

### Key Commands

- `python manage.py npm_install` - Install npm dependencies from all package.json5 files
- `python manage.py transpile` - Transpile JavaScript files
- `python manage.py transpile --force` - Force transpilation even if no changes detected
- `python manage.py collectstatic` - Collect static files (runs transpile first)
- `python manage.py setup` - Complete setup (migrate, transpile, load fixtures)

### Transpilation Process

1. **Package.json merging**: All `package.json5` files from installed apps are merged
2. **NPM install**: Dependencies are installed to `.transpile/node_modules/`
3. **Rspack bundling**: JavaScript files are bundled using rspack configuration
4. **Output**: Bundled files are written to `static-transpile/` with versioned filenames
5. **Service worker**: In production, a service worker is generated for offline support

### Watched File Extensions

The development server watches for changes in:
- `.js` files
- `.mjs` files
- `.json5` files

When changes are detected, transpilation runs automatically (with 30-second throttle).

## Running the Application

### Development Server

```bash
python manage.py runserver
```

This command:
- Runs database migrations
- Installs npm dependencies (if needed)
- Transpiles JavaScript (if needed)
- Starts the Daphne ASGI server
- Watches for JavaScript changes and auto-transpiles

### Production Deployment

For production:

1. Set `DEBUG = False` in configuration.py
2. Configure proper database (PostgreSQL/MySQL recommended)
3. Set `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS`
4. Run setup: `python manage.py setup --no-force-transpile`
5. Collect static files: `python manage.py collectstatic`
6. Use a proper ASGI server (Daphne, uvicorn, etc.)

## Testing

### Test Framework

- **Framework**: Django's built-in test framework
- **Live Server**: ChannelsLiveServerTestCase (for WebSocket support)
- **Browser Testing**: Selenium WebDriver
- **Test Requirements**: Install with `pip install -r test-requirements.txt`

### Running Tests

```bash
# Run all tests
python manage.py test

# Run tests for specific app
python manage.py test document

# Run with coverage
coverage run --source='.' manage.py test
coverage report
```

### Test Structure

Tests are located in `<app>/tests/` directories:
- `test_admin.py` - Admin interface tests
- `test_collaboration.py` - Real-time collaboration tests
- `test_overview.py` - Overview/listing page tests

Tests use Selenium for browser automation and test real-time collaborative editing features.

## Configuration

### Key Configuration Files

- **configuration.py**: User-specific settings (not in version control)
- **configuration-default.py**: Template with all available settings
- **base/settings.py**: Base Django settings (don't modify directly)

### Important Settings

- `DEBUG`: Enable/disable debug mode (default: True)
- `SOURCE_MAPS`: Enable JavaScript source maps for debugging
- `DATABASES`: Database configuration (default: SQLite)
- `PORTS`: List of ports to run on (default: [8000])
- `REGISTRATION_OPEN`: Allow new user registration
- `PASSWORD_LOGIN`: Enable password-based login
- `SOCIALACCOUNT_OPEN`: Enable social account login
- `MEDIA_MAX_SIZE`: Max size for user uploads
- `USE_SERVICE_WORKER`: Enable service worker for offline support

## Database

### Migrations

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database (development only)
python manage.py setup --restart
```

### Default Database

SQLite is used by default. For production, configure PostgreSQL or MySQL in `configuration.py`.

## Static Files

### Static File Locations

- `static-transpile/`: Transpiled JavaScript (auto-generated)
- `static-libs/`: Third-party libraries (fontawesome, prosemirror CSS, mathlive)
- `<app>/static/`: App-specific static files
- `static-collected/`: Collected static files for production (via collectstatic)

### Static File URLs

- Development: Files served from individual static directories
- Production: Files collected to `static-collected/` and served by web server

## Real-time Collaboration

Fidus Writer uses Django Channels for WebSocket-based real-time collaboration:

- **Protocol**: WebSocket
- **Routing**: Defined in `base/routing.py` and app-level `ws_urls.py`
- **Consumers**: Handle WebSocket connections (e.g., `document/consumers.py`)
- **Collaboration**: Multiple users can edit the same document simultaneously

## Common Tasks

### Adding a New Django App

1. Create the app: `python manage.py startapp myapp`
2. Add to `INSTALLED_APPS` in `configuration.py`
3. Create migrations: `python manage.py makemigrations myapp`
4. Apply migrations: `python manage.py migrate`

### Adding JavaScript Dependencies

1. Create/edit `package.json5` in your app directory
2. Add dependencies to the `dependencies` object
3. Run `python manage.py npm_install`
4. Import in your JavaScript: `import something from 'package-name'`

### Modifying Templates

1. Templates are in `<app>/templates/` directories
2. Override templates by placing them in project-level `templates/` directory
3. Use Django template inheritance

### Debugging JavaScript

1. Enable source maps: Set `SOURCE_MAPS = 'source-map'` in configuration.py
2. Open browser developer tools
3. Source maps allow debugging original source files

## Localization

### Translation Files

- Locale files: `fiduswriter/locale/`
- Commands:
  - `python manage.py makemessages`: Extract translatable strings
  - `python manage.py compilemessages`: Compile .po files to .mo

### Supported Languages

English, Bulgarian, German, French, Italian, Spanish, Portuguese (Brazil)

## Contributing

See http://fiduswriter.org/help-us/ for contribution guidelines.

## Troubleshooting

### Transpilation Issues

- Clear transpile cache: Delete `.transpile/` directory
- Force transpile: `python manage.py transpile --force`
- Check JavaScript syntax errors in source files

### Database Issues

- Reset database: `python manage.py setup --restart` (WARNING: deletes all data)
- Check migrations: `python manage.py showmigrations`

### Port Already in Use

- Change port in `configuration.py`: `PORTS = [8001]`
- Or kill process using port 8000

### Import Errors

- Ensure all dependencies installed: `pip install -r requirements.txt`
- Check Python version compatibility
- Verify npm dependencies: `python manage.py npm_install --force`

## Additional Resources

- **Wiki**: https://github.com/fiduswriter/fiduswriter/wiki/
- **Issues**: https://github.com/fiduswriter/fiduswriter/issues
- **Coverage**: https://coveralls.io/github/fiduswriter/fiduswriter

## Notes for AI Agents

1. **Transpilation is automatic**: When running `python manage.py runserver`, JavaScript changes are detected and transpiled automatically. Don't manually run transpile unless needed.

2. **Package.json5 format**: Note the `.json5` extension - this format allows comments, which regular JSON doesn't.

3. **Multiple apps**: This is a modular Django project with many apps (base, document, bibliography, user, etc.). Each can have its own package.json5 for JavaScript dependencies.

4. **Real-time features**: The project heavily uses WebSockets for collaborative editing. When debugging, consider both HTTP and WebSocket connections.

5. **django-npm-mjs**: This package handles all the JavaScript build process. The `transpile` management command comes from this package.

6. **Configuration hierarchy**: Settings are loaded in order: Django defaults → base/settings.py → configuration.py. User overrides go in configuration.py.

7. **Test database**: Tests automatically use a separate test database (testdb.sqlite3).

8. **Service worker**: In production mode, a service worker is generated for offline support. This is handled automatically during transpilation.