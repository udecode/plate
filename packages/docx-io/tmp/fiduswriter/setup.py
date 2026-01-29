from glob import glob
from setuptools import find_namespace_packages, setup
from setuptools.command.sdist import sdist as _sdist
from setuptools.command.bdist_egg import bdist_egg as _bdist_egg
from setuptools.command.install import install
from setuptools.command.build_py import build_py as _build_py
from wheel.bdist_wheel import bdist_wheel as _bdist_wheel
from babel.messages.frontend import compile_catalog as _compile_catalog


class compile_catalog(_compile_catalog):
    def initialize_options(self):
        super().initialize_options()
        self.domain = ["django", "djangojs"]
        self.directory = "fiduswriter/locale"


# From https://github.com/pypa/setuptools/pull/1574
class build_py(_build_py):
    def find_package_modules(self, package, package_dir):
        modules = super().find_package_modules(package, package_dir)
        patterns = self._get_platform_patterns(
            self.exclude_package_data,
            package,
            package_dir,
        )

        excluded_module_files = []
        for pattern in patterns:
            excluded_module_files.extend(glob(pattern))

        for f in excluded_module_files:
            for module in modules:
                if module[2] == f:
                    modules.remove(module)
        return modules


class bdist_egg(_bdist_egg):
    def run(self):
        self.run_command("compile_catalog")
        _bdist_egg.run(self)


class sdist(_sdist):
    """Custom build command."""

    def run(self):
        self.run_command("compile_catalog")
        _sdist.run(self)


class bdist_wheel(_bdist_wheel):
    """Custom build command."""

    def run(self):
        self.run_command("compile_catalog")
        _bdist_wheel.run(self)


cmdclass = {
    "compile_catalog": compile_catalog,
    "sdist": sdist,
    "build_py": build_py,
    "bdist_egg": bdist_egg,
    "bdist_wheel": bdist_wheel,
    "install": install,
}


setup(
    cmdclass=cmdclass,
    packages=find_namespace_packages(include=["fiduswriter"]),
    include_package_data=True,
    exclude_package_data={
        "": [
            "*.pyc",
            "*.pyo",
            "*.po",
            "*.pot",
            "*.db",
            ".*.db",
            "*.sqlite3",
            "ci/*",
            "build/*",
            "fiduswriter/media/*",
            "fiduswriter/.transpile/*",
            "fiduswriter/static-transpile/*",
            "fiduswriter/static-collected/*",
            "fiduswriter/static-libs/*",
            "fiduswriter/venv/*",
            "fiduswriter/media/*",
            "fiduswriter/static-transpile/*",
            "fiduswriter/static-libs/*",
            "fiduswriter/book/*",
            "fiduswriter/citation-api-import/*",
            "fiduswriter/languagetool/*",
            "fiduswriter/npm_mjs/*",
            "fiduswriter/ojs/*",
            "fiduswriter/phplist/*",
            "fiduswriter/payment/*",
            "fiduswriter/website/*",
            "fiduswriter/pandoc/*",
        ]
    },
)
