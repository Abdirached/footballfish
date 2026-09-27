from .base import DataSource
from .statsbomb import StatsBomb


_data_source = None


def get_data_source() -> DataSource:
    global _data_source
    if _data_source is None:
        _data_source = StatsBomb()
    return _data_source


def set_data_source(source: DataSource):
    global _data_source
    _data_source = source
