import argparse
from subprocess import call
import os

parser = argparse.ArgumentParser(
    prog="jp-noui",
    description="Launches jupyter lab with noui enabled.",
)
parser.add_argument("notebook", help="Path to notebook to display and run.")
def cli():
    kwargs = parser.parse_args()
    os.environ["JUPYTER_NOUI"] = "1"
    call(["jupyter", "lab", kwargs.notebook])